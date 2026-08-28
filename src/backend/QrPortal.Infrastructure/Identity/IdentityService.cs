using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Infrastructure.Configuration;
using QrPortal.Infrastructure.Persistence;
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
        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null)
        {
            return OperationResult<UserSessionDto>.Fail("email_in_use", "Este e-mail já está cadastrado.");
        }

        var user = new ApplicationUser { Id = Guid.CreateVersion7(), UserName = email, Email = email, EmailConfirmed = environment.IsEnvironment("E2E") };
        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return OperationResult<UserSessionDto>.Fail("validation_error", result.Errors.Select(error => error.Description).ToArray());
        }

        if (!user.EmailConfirmed) await SendConfirmationAsync(user, cancellationToken);
        await signInManager.SignInAsync(user, isPersistent: false);
        await Audit(user.Id, "auth.registered", cancellationToken);
        return OperationResult<UserSessionDto>.Ok(ToDto(user));
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
        return OperationResult<UserSessionDto>.Ok(ToDto(user));
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
        if (user is null) return OperationResult.Fail("invalid_token", "Link de confirmação inválido.");
        string token;
        try { token = System.Text.Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token)); }
        catch (FormatException) { return OperationResult.Fail("invalid_token", "Link de confirmação inválido."); }
        var result = await userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded) await Audit(user.Id, "auth.email_confirmed", cancellationToken);
        return result.Succeeded
            ? OperationResult.Ok()
            : OperationResult.Fail("invalid_token", result.Errors.Select(error => error.Description).ToArray());
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim());
        if (user is null) return;
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(System.Text.Encoding.UTF8.GetBytes(token));
        var link = $"{frontendOptions.Value.PublicBaseUrl.TrimEnd('/')}/redefinir-senha?userId={user.Id}&token={encoded}";
        await emailSender.SendAsync(user.Email!, "Redefina sua senha no QRPortal", $"<p>Use o link para redefinir sua senha:</p><p><a href=\"{link}\">Redefinir senha</a></p>", cancellationToken);
    }

    public async Task<OperationResult> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user is null) return OperationResult.Fail("invalid_token", "Link de redefinição inválido.");
        string token;
        try { token = System.Text.Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token)); }
        catch (FormatException) { return OperationResult.Fail("invalid_token", "Link de redefinição inválido."); }
        var result = await userManager.ResetPasswordAsync(user, token, request.NewPassword);
        return result.Succeeded ? OperationResult.Ok() : OperationResult.Fail("validation_error", result.Errors.Select(error => error.Description).ToArray());
    }

    public async Task<UserSessionDto?> GetCurrentAsync(CancellationToken cancellationToken)
    {
        var user = await signInManager.UserManager.GetUserAsync(signInManager.Context.User);
        return user is null ? null : ToDto(user);
    }

    public async Task<OperationResult<UserSessionDto>> CompleteExternalLoginAsync(ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email)) return OperationResult<UserSessionDto>.Fail("external_login_failed", "O Google não forneceu um e-mail válido.");

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser { Id = Guid.CreateVersion7(), Email = email, UserName = email, EmailConfirmed = true };
            var created = await userManager.CreateAsync(user);
            if (!created.Succeeded) return OperationResult<UserSessionDto>.Fail("external_login_failed", created.Errors.Select(error => error.Description).ToArray());
        }
        else if (!user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            await userManager.UpdateAsync(user);
        }

        await signInManager.SignInAsync(user, isPersistent: false);
        return OperationResult<UserSessionDto>.Ok(ToDto(user));
    }

    private async Task SendConfirmationAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encoded = WebEncoders.Base64UrlEncode(System.Text.Encoding.UTF8.GetBytes(token));
        var link = $"{frontendOptions.Value.PublicBaseUrl.TrimEnd('/')}/confirmar-email?userId={user.Id}&token={encoded}";
        await emailSender.SendAsync(user.Email!, "Confirme seu e-mail no QRPortal", $"<p>Confirme seu e-mail para publicar seu cardápio:</p><p><a href=\"{link}\">Confirmar e-mail</a></p>", cancellationToken);
    }

    private static UserSessionDto ToDto(ApplicationUser user) => new(user.Id, user.Email!, user.EmailConfirmed);

    private async Task Audit(Guid? actorId, string eventName, CancellationToken cancellationToken)
    {
        var correlationId = httpContextAccessor.HttpContext?.TraceIdentifier ?? Guid.CreateVersion7().ToString("N");
        db.AuditLogs.Add(new AuditLog(actorId, eventName, nameof(ApplicationUser), actorId, correlationId));
        await db.SaveChangesAsync(cancellationToken);
    }
}
