using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Api.Controllers;

[Route("api/v1/auth")]
public sealed class AuthController(IIdentityService identity, IAntiforgery antiforgery, IOptions<FrontendOptions> frontend) : ApiControllerBase
{
    // A URL pública é configurada por ambiente e pode chegar com barra final.
    private string FrontendBaseUrl => frontend.Value.PublicBaseUrl.TrimEnd('/');

    [HttpGet("csrf")]
    [AllowAnonymous]
    public ActionResult<object> Csrf()
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { token = tokens.RequestToken });
    }

    [HttpGet("providers")]
    [AllowAnonymous]
    public ActionResult<AuthenticationProvidersDto> Providers()
    {
        var configuration = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var google = !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"])
            && !string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]);
        return Ok(new AuthenticationProvidersDto(google));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<UserSessionDto>> Register(RegisterRequest request, CancellationToken cancellationToken)
        => FromResult(await identity.RegisterAsync(request, cancellationToken));

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<UserSessionDto>> Login(LoginRequest request, CancellationToken cancellationToken)
        => FromResult(await identity.LoginAsync(request, cancellationToken));

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        await identity.LogoutAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("confirm-email")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ConfirmEmail(ConfirmEmailRequest request, CancellationToken cancellationToken)
        => FromResult(await identity.ConfirmEmailAsync(request, cancellationToken));

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        await identity.ForgotPasswordAsync(request, cancellationToken);
        return Accepted(new { message = "Se o e-mail existir, enviaremos as instruções." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
        => FromResult(await identity.ResetPasswordAsync(request, cancellationToken));

    [HttpGet("google/start")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public IActionResult GoogleStart()
    {
        var configuration = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        if (string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"]) || string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]))
            return ApiProblem("google_not_configured", ["Google OAuth ainda não está configurado."], 501);
        return Challenge(new AuthenticationProperties { RedirectUri = Url.Action(nameof(GoogleComplete)) }, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google/complete")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> GoogleComplete(CancellationToken cancellationToken)
    {
        var external = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
        if (!external.Succeeded || external.Principal is null) return Redirect($"{FrontendBaseUrl}/login?error=google");
        var result = await identity.LoginExternalAsync(external.Principal, cancellationToken);
        if (result.Succeeded)
        {
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            return Redirect($"{FrontendBaseUrl}/app");
        }
        if (result.Code == "external_registration_required")
            return Redirect($"{FrontendBaseUrl}/cadastro-google");

        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        return Redirect($"{FrontendBaseUrl}/login?error=google");
    }

    [HttpGet("google/pending")]
    [AllowAnonymous]
    public async Task<ActionResult<ExternalLoginPendingDto>> GooglePending()
    {
        var external = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
        if (!external.Succeeded || external.Principal is null) return Unauthorized();
        var pending = identity.GetPendingExternal(external.Principal);
        return pending is null ? Unauthorized() : Ok(pending);
    }

    [HttpPost("google/register")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<UserSessionDto>> GoogleRegister(ExternalRegistrationRequest request, CancellationToken cancellationToken)
    {
        var external = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
        if (!external.Succeeded || external.Principal is null)
            return ApiProblem("external_login_expired", ["A sessão do Google expirou. Comece novamente."], 401);

        var result = await identity.RegisterExternalAsync(external.Principal, request, cancellationToken);
        if (result.Succeeded) await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        return FromResult(result);
    }
}
