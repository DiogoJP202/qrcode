using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;

namespace QrPortal.Api.Controllers;

[Authorize]
[Route("api/v1/categories")]
public sealed class CategoriesController(IMenuService menus) : ApiControllerBase
{
    [HttpPatch("{categoryId:guid}")]
    public Task<CategoryDto> Update(Guid categoryId, UpdateCategoryRequest request, CancellationToken cancellationToken) => menus.UpdateCategoryAsync(categoryId, request, cancellationToken);

    [HttpDelete("{categoryId:guid}")]
    public async Task<IActionResult> Delete(Guid categoryId, CancellationToken cancellationToken)
    {
        await menus.DeleteCategoryAsync(categoryId, cancellationToken);
        return NoContent();
    }
}
