using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;

namespace QrPortal.Api.Controllers;

[Route("api/v1/public/menus")]
public sealed class PublicMenusController(IMenuService menus) : ApiControllerBase
{
    [HttpGet("{slug}")]
    [AllowAnonymous]
    [EnableRateLimiting("public-menu")]
    public async Task<ActionResult<PublicMenuDto>> Get(string slug, CancellationToken cancellationToken)
    {
        var menu = await menus.GetPublicAsync(slug, cancellationToken);
        if (menu is null) return NotFound();
        SetPublicCache(menu.UpdatedAt);
        if (Request.Headers.IfNoneMatch == Response.Headers.ETag) return StatusCode(StatusCodes.Status304NotModified);
        return Ok(menu);
    }

    private void SetPublicCache(DateTimeOffset updatedAt)
    {
        Response.Headers.ETag = $"\"{updatedAt.UtcTicks:x}\"";
        Response.Headers.CacheControl = "public,max-age=0,must-revalidate,stale-while-revalidate=60";
    }
}
