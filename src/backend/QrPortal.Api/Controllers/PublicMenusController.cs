using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using QrPortal.Application.Abstractions;

namespace QrPortal.Api.Controllers;

[Route("api/v1/public/menus")]
public sealed class PublicMenusController(IMenuService menus) : ApiControllerBase
{
    [HttpGet("{slug}")]
    [AllowAnonymous]
    [EnableRateLimiting("public-menu")]
    public async Task<IActionResult> Get(string slug, CancellationToken cancellationToken)
    {
        var menu = await menus.GetPublicAsync(slug, cancellationToken);
        if (menu is null) return NotFound();
        var etag = $"\"{menu.UpdatedAt.UtcTicks:x}\"";
        if (Request.Headers.IfNoneMatch == etag) return StatusCode(StatusCodes.Status304NotModified);
        Response.Headers.ETag = etag;
        Response.Headers.CacheControl = "public,max-age=0,must-revalidate,stale-while-revalidate=60";
        return Ok(menu);
    }
}
