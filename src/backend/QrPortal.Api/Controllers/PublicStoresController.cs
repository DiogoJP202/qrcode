using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Api.Controllers;

[Route("api/v1/public/stores")]
public sealed class PublicStoresController(IStoreService stores, IQrCodeService qrCodes, IOptions<FrontendOptions> frontendOptions) : ApiControllerBase
{
    [HttpGet("{slug}")]
    [AllowAnonymous]
    [EnableRateLimiting("public-menu")]
    public async Task<ActionResult<PublicStoreDto>> Get(string slug, CancellationToken cancellationToken)
    {
        var store = await stores.GetPublicAsync(slug, cancellationToken);
        if (store is null) return NotFound();
        SetPublicCache(store.UpdatedAt);
        if (Request.Headers.IfNoneMatch == Response.Headers.ETag) return StatusCode(StatusCodes.Status304NotModified);
        return Ok(store);
    }

    [HttpGet("{slug}/qr.{format:regex(^(svg|png)$)}")]
    [AllowAnonymous]
    [EnableRateLimiting("public-menu")]
    public async Task<IActionResult> GetQr(string slug, string format, [FromQuery] bool download, CancellationToken cancellationToken)
    {
        var store = await stores.GetPublicAsync(slug, cancellationToken);
        if (store is null) return NotFound();
        var url = $"{frontendOptions.Value.PublicBaseUrl.TrimEnd('/')}/empresa/{store.Slug}";
        SetPublicCache(store.UpdatedAt);
        var fileName = $"qr-negocio-{store.Slug}.{format}";
        if (format.Equals("png", StringComparison.OrdinalIgnoreCase))
        {
            var content = qrCodes.GeneratePng(url);
            return download ? File(content, "image/png", fileName) : File(content, "image/png");
        }

        var svg = Encoding.UTF8.GetBytes(qrCodes.GenerateSvg(url));
        return download ? File(svg, "image/svg+xml", fileName) : File(svg, "image/svg+xml");
    }

    private void SetPublicCache(DateTimeOffset updatedAt)
    {
        Response.Headers.ETag = $"\"{updatedAt.UtcTicks:x}\"";
        Response.Headers.CacheControl = "public,max-age=0,must-revalidate,stale-while-revalidate=60";
    }
}
