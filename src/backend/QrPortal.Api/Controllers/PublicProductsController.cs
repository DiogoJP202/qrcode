using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Api.Controllers;

[Route("api/v1/public/products")]
public sealed class PublicProductsController(IMenuService menus, IQrCodeService qrCodes, IOptions<FrontendOptions> frontendOptions) : ApiControllerBase
{
    [HttpGet("{productId:guid}")]
    [AllowAnonymous]
    [EnableRateLimiting("public-menu")]
    public async Task<ActionResult<PublicProductDetailDto>> Get(Guid productId, CancellationToken cancellationToken)
    {
        var product = await menus.GetPublicProductAsync(productId, cancellationToken);
        if (product is null) return NotFound();
        SetPublicCache(product.UpdatedAt);
        if (Request.Headers.IfNoneMatch == Response.Headers.ETag) return StatusCode(StatusCodes.Status304NotModified);
        return Ok(product);
    }

    [HttpGet("{productId:guid}/qr.{format:regex(^(svg|png)$)}")]
    [AllowAnonymous]
    [EnableRateLimiting("public-menu")]
    public async Task<IActionResult> GetQr(Guid productId, string format, [FromQuery] bool download, CancellationToken cancellationToken)
    {
        var product = await menus.GetPublicProductAsync(productId, cancellationToken);
        if (product is null) return NotFound();

        var productUrl = $"{frontendOptions.Value.PublicBaseUrl.TrimEnd('/')}/p/{product.Product.Id:D}";
        SetPublicCache(product.UpdatedAt);
        var fileName = $"qr-{product.Product.Id:N}.{format}";
        if (format.Equals("png", StringComparison.OrdinalIgnoreCase))
        {
            var content = qrCodes.GeneratePng(productUrl);
            return download ? File(content, "image/png", fileName) : File(content, "image/png");
        }

        var svg = Encoding.UTF8.GetBytes(qrCodes.GenerateSvg(productUrl));
        return download ? File(svg, "image/svg+xml", fileName) : File(svg, "image/svg+xml");
    }

    private void SetPublicCache(DateTimeOffset updatedAt)
    {
        Response.Headers.ETag = $"\"{updatedAt.UtcTicks:x}\"";
        Response.Headers.CacheControl = "public,max-age=0,must-revalidate,stale-while-revalidate=60";
    }
}
