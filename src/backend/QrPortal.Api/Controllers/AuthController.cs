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
    [HttpGet("csrf")]
    [AllowAnonymous]
    public ActionResult<object> Csrf()
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { token = tokens.RequestToken });
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
    public IActionResult GoogleStart()
    {
        var configuration = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        if (string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientId"]) || string.IsNullOrWhiteSpace(configuration["Authentication:Google:ClientSecret"]))
            return ApiProblem("google_not_configured", ["Google OAuth ainda não está configurado."], 501);
        return Challenge(new AuthenticationProperties { RedirectUri = Url.Action(nameof(GoogleComplete)) }, GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google/complete")]
    [AllowAnonymous]
    public async Task<IActionResult> GoogleComplete(CancellationToken cancellationToken)
    {
        var external = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
        if (!external.Succeeded || external.Principal is null) return Redirect($"{frontend.Value.PublicBaseUrl}/login?error=google");
        var result = await identity.CompleteExternalLoginAsync(external.Principal, cancellationToken);
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
        return Redirect(result.Succeeded ? $"{frontend.Value.PublicBaseUrl}/app" : $"{frontend.Value.PublicBaseUrl}/login?error=google");
    }
}
