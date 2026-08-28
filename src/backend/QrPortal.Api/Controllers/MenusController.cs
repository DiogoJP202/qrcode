using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;

namespace QrPortal.Api.Controllers;

[Authorize]
[Route("api/v1/menus")]
public sealed class MenusController(IMenuService menus) : ApiControllerBase
{
    [HttpGet("{menuId:guid}")]
    public Task<MenuDto> Get(Guid menuId, CancellationToken cancellationToken) => menus.GetAsync(menuId, cancellationToken);

    [HttpPatch("{menuId:guid}")]
    public Task<MenuDto> Update(Guid menuId, UpdateMenuRequest request, CancellationToken cancellationToken) => menus.UpdateAsync(menuId, request, cancellationToken);

    [HttpPost("{menuId:guid}/publish")]
    public Task<MenuDto> Publish(Guid menuId, CancellationToken cancellationToken) => menus.PublishAsync(menuId, cancellationToken);

    [HttpPost("{menuId:guid}/archive")]
    public async Task<IActionResult> Archive(Guid menuId, CancellationToken cancellationToken)
    {
        await menus.ArchiveAsync(menuId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{menuId:guid}/categories")]
    public async Task<ActionResult<CategoryDto>> AddCategory(Guid menuId, CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await menus.AddCategoryAsync(menuId, request, cancellationToken);
        return Created($"/api/v1/categories/{category.Id}", category);
    }

    [HttpPut("{menuId:guid}/categories/order")]
    public async Task<IActionResult> ReorderCategories(Guid menuId, ReorderRequest request, CancellationToken cancellationToken)
    {
        await menus.ReorderCategoriesAsync(menuId, request, cancellationToken);
        return NoContent();
    }

    [HttpPost("{menuId:guid}/products")]
    public async Task<ActionResult<ProductDto>> AddProduct(Guid menuId, CreateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await menus.AddProductAsync(menuId, request, cancellationToken);
        return Created($"/api/v1/products/{product.Id}", product);
    }

    [HttpPut("{menuId:guid}/products/order")]
    public async Task<IActionResult> ReorderProducts(Guid menuId, ReorderRequest request, CancellationToken cancellationToken)
    {
        await menus.ReorderProductsAsync(menuId, request, cancellationToken);
        return NoContent();
    }

    [HttpGet("{menuId:guid}/theme")]
    public async Task<ThemeDto> Theme(Guid menuId, CancellationToken cancellationToken) => (await menus.GetAsync(menuId, cancellationToken)).Theme;

    [HttpPut("{menuId:guid}/theme")]
    public Task<ThemeDto> UpdateTheme(Guid menuId, UpdateThemeRequest request, CancellationToken cancellationToken) => menus.UpdateThemeAsync(menuId, request, cancellationToken);
}
