using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;

namespace QrPortal.Api.Controllers;

[Authorize]
[Route("api/v1/stores")]
public sealed class StoresController(IStoreService stores, IMenuService menus, IMediaService media) : ApiControllerBase
{
    [HttpGet]
    public Task<PagedResult<StoreDto>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default) => stores.ListAsync(page, pageSize, cancellationToken);

    [HttpGet("{storeId:guid}")]
    public Task<StoreDto> Get(Guid storeId, CancellationToken cancellationToken) => stores.GetAsync(storeId, cancellationToken);

    [HttpPost]
    public async Task<ActionResult<StoreDto>> Create(CreateStoreRequest request, CancellationToken cancellationToken)
    {
        var store = await stores.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { storeId = store.Id }, store);
    }

    [HttpPatch("{storeId:guid}")]
    public Task<StoreDto> Update(Guid storeId, UpdateStoreRequest request, CancellationToken cancellationToken) => stores.UpdateAsync(storeId, request, cancellationToken);

    [HttpGet("{storeId:guid}/menus")]
    public Task<PagedResult<MenuSummaryDto>> Menus(Guid storeId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default) => menus.ListAsync(storeId, page, pageSize, cancellationToken);

    [HttpPost("{storeId:guid}/menus")]
    public async Task<ActionResult<MenuDto>> CreateMenu(Guid storeId, CreateMenuRequest request, CancellationToken cancellationToken)
    {
        var menu = await menus.CreateAsync(storeId, request, cancellationToken);
        return CreatedAtAction(nameof(MenusController.Get), "Menus", new { menuId = menu.Id }, menu);
    }

    [HttpPut("{storeId:guid}/logo")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("upload")]
    public async Task<IActionResult> SetLogo(Guid storeId, IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        var url = await media.SetStoreLogoAsync(storeId, stream, file.ContentType, file.Length, cancellationToken);
        return Ok(new { url });
    }
}
