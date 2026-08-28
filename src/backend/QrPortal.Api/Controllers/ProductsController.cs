using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;

namespace QrPortal.Api.Controllers;

[Authorize]
[Route("api/v1/products")]
public sealed class ProductsController(IMenuService menus, IMediaService media) : ApiControllerBase
{
    [HttpPatch("{productId:guid}")]
    public Task<ProductDto> Update(Guid productId, UpdateProductRequest request, CancellationToken cancellationToken) => menus.UpdateProductAsync(productId, request, cancellationToken);

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Delete(Guid productId, CancellationToken cancellationToken)
    {
        await menus.DeleteProductAsync(productId, cancellationToken);
        return NoContent();
    }

    [HttpPut("{productId:guid}/image")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("upload")]
    public async Task<UploadResultDto> SetImage(Guid productId, IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        return await media.SetProductImageAsync(productId, stream, file.ContentType, file.Length, cancellationToken);
    }
}
