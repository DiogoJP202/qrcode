using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;

namespace QrPortal.Api.Controllers;

[Authorize]
[Route("api/v1/me")]
public sealed class MeController(IIdentityService identity, IStoreService stores) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var user = await identity.GetCurrentAsync(cancellationToken);
        if (user is null) return Unauthorized();
        var onboarding = await stores.GetOnboardingAsync(cancellationToken);
        return Ok(new { user, onboarding });
    }

    [HttpPatch]
    public async Task<ActionResult<UserSessionDto>> Update(UpdateProfileRequest request, CancellationToken cancellationToken)
        => FromResult(await identity.UpdateProfileAsync(request, cancellationToken));
}
