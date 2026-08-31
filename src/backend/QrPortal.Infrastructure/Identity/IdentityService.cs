using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Infrastructure.Configuration;
using QrPortal.Infrastructure.Persistence;
using QrPortal.Domain.Identity;
using QrPortal.Domain.Plans;

namespace QrPortal.Infrastructure.Identity;

public sealed class IdentityService(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    ITransactionalEmailSender emailSender,
    IOptions<FrontendOptions> frontendOptions,
    ApplicationDbContext db,
    IHttpContextAccessor httpContextAccessor,
    IHostEnvironment environment) : IIdentityService
{
    public async Task<OperationResult<UserSessionDto>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var profile = ValidateRegistration(request.FullName, request.PhoneNumber, request.AcceptTerms, request.TermsVersion, request.Latitude, request.Longitude, request.LocationAccuracyMeters);
        if (!profile.Succeeded || profile.Value is null)
            return OperationResult<UserSessionDto>.Fail(profile.Code ?? "validation_error", profile.Errors?.ToArray() ?? ["Dados de cadastro inválidos."]);

        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            return OperationResult<UserSessionDto>.Fail("email_in_use", "Este e-mail já está cadastrado.");
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var user = new ApplicationUser
        {
            Id = Guid.CreateVersion7(),
            UserName = email,
            Email = email,
            EmailConfirmed = environment.IsEnvironment("E2E"),
            FullName = profile.Value.FullName,
            PhoneNumber = profile.Value.PhoneNumber
        };
        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return OperationResult<UserSessionDto>.Fail("validation_error", result.Errors.Select(error => error.Description).ToArray());
        }

        AddTermsAcceptance(user.Id, request.TermsVersion, request.Latitude, request.Longitude, request.LocationAccuracyMeters);
        AddAudit(user.Id, "auth.registered");
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        if (!user.EmailConfirmed) await SendConfirmationAsync(user, cancellationToken);
        await signInManager.SignInAsync(user, isPersistent: false);
        return OperationResult<UserSessionDto>.Ok(await ToDtoAsync(user, cancellationToken));
    }

    public async Task<OperationResult<UserSessionDto>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null)
        {
            await Task.Delay(Random.Shared.Next(50, 120), cancellationToken);
            await Audit(null, "auth.login_failed", cancellationToken);
            return OperationResult<UserSessionDto>.Fail("invalid_credentials", "E-mail ou senha inválidos.");
        }

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (result.IsLockedOut) { await Audit(user.Id, "auth.locked_out", cancellationToken); return OperationResult<UserSessionDto>.Fail("locked_out", "Conta temporariamente bloqueada. Tente novamente mais tarde."); }
        if (!result.Succeeded) { await Audit(user.Id, "auth.login_failed", cancellationToken); return OperationResult<UserSessionDto>.Fail("invalid_credentials", "E-mail ou senha inválidos."); }
        await signInManager.SignInAsync(user, new AuthenticationProperties
        {
            IsPersistent = request.RememberMe,
            AllowRefresh = true,
            ExpiresUtc = DateTimeOffset.UtcNow.Add(request.RememberMe ? TimeSpan.FromDays(30) : TimeSpan.FromHours(8))
        });
        await Audit(user.Id, "auth.login_succeeded", cancellationToken);
        return OperationResult<UserSessionDto>.Ok(await ToDtoAsync(user, cancellationToken));
    }

    public async Task LogoutAsync(CancellationToken cancellationToken)
    {
        var user = await signInManager.UserManager.GetUserAsync(signInManager.Context.User);
        await signInManager.SignOutAsync();
        await Audit(user?.Id, "auth.logged_out", cancellationToken);
    }

    public async Task<OperationResult> ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null)
        {
            await Audit(null, "auth.email_confirmation_failed", cancellationToken);
            return OperationResult.Fail("invalid_token", "Link de confirmação inválido.");
        }
        string token;
        try { token = System.Text.Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token)); }
        catch (FormatException)
        {
            await Audit(user.Id, "auth.email_confirmation_failed", cancellationToken);
            return OperationResult.Fail("invalid_token", "Link de confirmação inválido.");
        }
        var result = await userManager.ConfirmEmailAsync(user, token);
        await Audit(user.Id, result.Succeeded ? "auth.email_confirmed" : "auth.email_confirmation_failed", cancellationToken);
        return result.Succeeded
            ? OperationResult.Ok()
            : OperationResult.Fail("invalid_token", result.Errors.Select(error => error.Description).ToArray());
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null)
        {
            await Audit(null, "auth.password_reset_requested", cancellationToken);
            return;
        }
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(System.Text.Encoding.UTF8.GetBytes(token));
        var link = $"{frontendOptions.Value.PublicBaseUrl.TrimEnd('/')}/redefinir-senha?userId={user.Id}&token={encoded}";
        await emailSender.SendAsync(user.Email!, "Redefina sua senha no QRPortal", $"<p>Use o link para redefinir sua senha:</p><p><a href=\"{link}\">Redefinir senha</a></p>", cancellationToken);
        await Audit(user.Id, "auth.password_reset_requested", cancellationToken);
    }

    public async Task<OperationResult> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null)
        {
            await Audit(null, "auth.password_reset_failed", cancellationToken);
            return OperationResult.Fail("invalid_token", "Link de redefinição inválido.");
        }
        string token;
        try { token = System.Text.Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token)); }
        catch (FormatException)
        {
            await Audit(user.Id, "auth.password_reset_failed", cancellationToken);
            return OperationResult.Fail("invalid_token", "Link de redefinição inválido.");
        }
        var result = await userManager.ResetPasswordAsync(user, token, request.NewPassword);
        await Audit(user.Id, result.Succeeded ? "auth.password_reset_succeeded" : "auth.password_reset_failed", cancellationToken);
        return result.Succeeded ? OperationResult.Ok() : OperationResult.Fail("validation_error", result.Errors.Select(error => error.Description).ToArray());
    }

    public async Task<UserSessionDto?> GetCurrentAsync(CancellationToken cancellationToken)
    {
        var user = await signInManager.UserManager.GetUserAsync(signInManager.Context.User);
        return user is null ? null : await ToDtoAsync(user, cancellationToken);
    }

    public async Task<OperationResult<UserSessionDto>> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var profile = ValidateProfile(request.FullName, request.PhoneNumber);
        if (!profile.Succeeded || profile.Value is null)
            return OperationResult<UserSessionDto>.Fail(profile.Code ?? "validation_error", profile.Errors?.ToArray() ?? ["Dados de perfil inválidos."]);

        var user = await userManager.GetUserAsync(signInManager.Context.User);
        if (user is null) return OperationResult<UserSessionDto>.Fail("authentication_required", "Faça login para atualizar seu perfil.");
        user.FullName = profile.Value.FullName;
        user.PhoneNumber = profile.Value.PhoneNumber;
        var updated = await userManager.UpdateAsync(user);
        if (!updated.Succeeded) return OperationResult<UserSessionDto>.Fail("validation_error", updated.Errors.Select(error => error.Description).ToArray());
        await Audit(user.Id, "account.profile_updated", cancellationToken);
        return OperationResult<UserSessionDto>.Ok(await ToDtoAsync(user, cancellationToken));
    }

    public ExternalLoginPendingDto? GetPendingExternal(ClaimsPrincipal principal)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        return string.IsNullOrWhiteSpace(email)
            ? null
            : new ExternalLoginPendingDto(email, principal.FindFirstValue(ClaimTypes.Name)?.Trim());
    }

    public async Task<OperationResult<UserSessionDto>> LoginExternalAsync(ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        var identity = ExternalIdentity(principal);
        if (identity is null)
        {
            await Audit(null, "auth.external_login_failed", cancellationToken);
            return OperationResult<UserSessionDto>.Fail("external_login_failed", "O Google não forneceu um e-mail válido.");
        }

        var user = await userManager.FindByLoginAsync("Google", identity.ProviderKey)
            ?? await userManager.FindByEmailAsync(identity.Email);
        if (user is null)
        {
            AddAudit(null, "auth.external_registration_required");
            await db.SaveChangesAsync(cancellationToken);
            return OperationResult<UserSessionDto>.Fail("external_registration_required", "Complete seu cadastro para continuar.");
        }

        var loginResult = await EnsureGoogleLogin(user, identity.ProviderKey);
        if (!loginResult.Succeeded)
        {
            await Audit(user.Id, "auth.external_login_failed", cancellationToken);
            return OperationResult<UserSessionDto>.Fail("external_login_failed", loginResult.Errors.Select(error => error.Description).ToArray());
        }

        user.EmailConfirmed = true;
        if (string.IsNullOrWhiteSpace(user.FullName) && !string.IsNullOrWhiteSpace(identity.SuggestedName)) user.FullName = identity.SuggestedName;
        await userManager.UpdateAsync(user);
        await signInManager.SignInAsync(user, isPersistent: false);
        await Audit(user.Id, "auth.external_login_succeeded", cancellationToken);
        return OperationResult<UserSessionDto>.Ok(await ToDtoAsync(user, cancellationToken));
    }

    public async Task<OperationResult<UserSessionDto>> RegisterExternalAsync(ClaimsPrincipal principal, ExternalRegistrationRequest request, CancellationToken cancellationToken)
    {
        var identity = ExternalIdentity(principal);
        if (identity is null)
        {
            await Audit(null, "auth.external_registration_failed", cancellationToken);
            return OperationResult<UserSessionDto>.Fail("external_login_failed", "A sessão do Google expirou. Tente novamente.");
        }

        var profile = ValidateRegistration(request.FullName, request.PhoneNumber, request.AcceptTerms, request.TermsVersion, request.Latitude, request.Longitude, request.LocationAccuracyMeters);
        if (!profile.Succeeded || profile.Value is null)
            return OperationResult<UserSessionDto>.Fail(profile.Code ?? "validation_error", profile.Errors?.ToArray() ?? ["Dados de cadastro inválidos."]);

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var user = await userManager.FindByEmailAsync(identity.Email);
        var createdAccount = user is null;
        if (user is null)
        {
            user = new ApplicationUser
            {
                Id = Guid.CreateVersion7(),
                Email = identity.Email,
                UserName = identity.Email,
                EmailConfirmed = true,
                FullName = profile.Value.FullName,
                PhoneNumber = profile.Value.PhoneNumber
            };
            var created = await userManager.CreateAsync(user);
            if (!created.Succeeded)
                return OperationResult<UserSessionDto>.Fail("external_login_failed", created.Errors.Select(error => error.Description).ToArray());
        }
        else
        {
            user.FullName = profile.Value.FullName;
            user.PhoneNumber = profile.Value.PhoneNumber;
            user.EmailConfirmed = true;
            await userManager.UpdateAsync(user);
        }

        var loginResult = await EnsureGoogleLogin(user, identity.ProviderKey);
        if (!loginResult.Succeeded)
            return OperationResult<UserSessionDto>.Fail("external_login_failed", loginResult.Errors.Select(error => error.Description).ToArray());

        if (!await db.TermsAcceptances.AnyAsync(item => item.UserId == user.Id && item.TermsVersion == request.TermsVersion, cancellationToken))
            AddTermsAcceptance(user.Id, request.TermsVersion, request.Latitude, request.Longitude, request.LocationAccuracyMeters);
        AddAudit(user.Id, createdAccount ? "auth.external_account_created" : "auth.external_account_completed");
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await signInManager.SignInAsync(user, isPersistent: false);
        await Audit(user.Id, "auth.external_login_succeeded", cancellationToken);
        return OperationResult<UserSessionDto>.Ok(await ToDtoAsync(user, cancellationToken));
    }

    private async Task SendConfirmationAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(System.Text.Encoding.UTF8.GetBytes(token));
        var link = $"{frontendOptions.Value.PublicBaseUrl.TrimEnd('/')}/confirmar-email?userId={user.Id}&token={encoded}";
        await emailSender.SendAsync(user.Email!, "Confirme seu e-mail no QRPortal", $"<p>Confirme seu e-mail para publicar seu cardápio:</p><p><a href=\"{link}\">Confirmar e-mail</a></p>", cancellationToken);
    }

    private async Task<UserSessionDto> ToDtoAsync(ApplicationUser user, CancellationToken cancellationToken)
        => new(
            user.Id,
            user.Email!,
            user.EmailConfirmed,
            user.FullName,
            user.PhoneNumber,
            await db.TermsAcceptances.AnyAsync(item => item.UserId == user.Id && item.TermsVersion == LegalDocumentVersions.CurrentTerms, cancellationToken));

    private static OperationResult<RegistrationProfile> ValidateRegistration(
        string fullName,
        string phoneNumber,
        bool acceptTerms,
        string termsVersion,
        decimal? latitude,
        decimal? longitude,
        decimal? accuracyMeters)
    {
        if (!acceptTerms || termsVersion != LegalDocumentVersions.CurrentTerms)
            return OperationResult<RegistrationProfile>.Fail("terms_required", "Aceite a versão atual dos Termos de Uso e da Política de Privacidade.");
        if ((latitude is null) != (longitude is null) || latitude is < -90 or > 90 || longitude is < -180 or > 180 || accuracyMeters is < 0 or > 100000)
            return OperationResult<RegistrationProfile>.Fail("validation_error", "Localização inválida.");
        return ValidateProfile(fullName, phoneNumber);
    }

    private static OperationResult<RegistrationProfile> ValidateProfile(string fullName, string phoneNumber)
    {
        var normalizedName = fullName?.Trim() ?? string.Empty;
        if (normalizedName.Length is < 3 or > 150 || normalizedName.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length < 2)
            return OperationResult<RegistrationProfile>.Fail("validation_error", "Informe seu nome completo.");

        var rawPhone = phoneNumber?.Trim() ?? string.Empty;
        var digits = new string(rawPhone.Where(char.IsAsciiDigit).ToArray());
        if (digits.Length is < 10 or > 15)
            return OperationResult<RegistrationProfile>.Fail("validation_error", "Informe um telefone válido com DDD.");
        var normalizedPhone = rawPhone.StartsWith('+') ? $"+{digits}" : digits;
        return OperationResult<RegistrationProfile>.Ok(new RegistrationProfile(normalizedName, normalizedPhone));
    }

    private ExternalIdentityData? ExternalIdentity(ClaimsPrincipal principal)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        var providerKey = principal.FindFirstValue(ClaimTypes.NameIdentifier)?.Trim();
        return string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(providerKey)
            ? null
            : new ExternalIdentityData(email, providerKey, principal.FindFirstValue(ClaimTypes.Name)?.Trim());
    }

    private async Task<IdentityResult> EnsureGoogleLogin(ApplicationUser user, string providerKey)
    {
        var existing = await userManager.GetLoginsAsync(user);
        return existing.Any(login => login.LoginProvider == "Google" && login.ProviderKey == providerKey)
            ? IdentityResult.Success
            : await userManager.AddLoginAsync(user, new UserLoginInfo("Google", providerKey, "Google"));
    }

    private void AddTermsAcceptance(Guid userId, string termsVersion, decimal? latitude, decimal? longitude, decimal? accuracyMeters)
    {
        var ipAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        db.TermsAcceptances.Add(new TermsAcceptance(userId, termsVersion, ipAddress, latitude, longitude, accuracyMeters));
    }

    private void AddAudit(Guid? actorId, string eventName)
    {
        var correlationId = httpContextAccessor.HttpContext?.TraceIdentifier ?? Guid.CreateVersion7().ToString("N");
        db.AuditLogs.Add(new AuditLog(actorId, eventName, nameof(ApplicationUser), actorId, correlationId));
    }

    private async Task Audit(Guid? actorId, string eventName, CancellationToken cancellationToken)
    {
        AddAudit(actorId, eventName);
        await db.SaveChangesAsync(cancellationToken);
    }

    private sealed record RegistrationProfile(string FullName, string PhoneNumber);
    private sealed record ExternalIdentityData(string Email, string ProviderKey, string? SuggestedName);
}
