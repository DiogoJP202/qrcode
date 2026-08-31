using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Domain.Menus;
using QrPortal.Domain.Plans;
using QrPortal.Infrastructure.Identity;
using QrPortal.Infrastructure.Persistence;

namespace QrPortal.Infrastructure.Services;

public sealed class MenuService(
    ApplicationDbContext db,
    ICurrentUser currentUser,
    IFileStorage storage,
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor) : IMenuService
{
    public async Task<PagedResult<MenuSummaryDto>> ListAsync(Guid storeId, int page, int pageSize, CancellationToken cancellationToken)
    {
        await EnsureStoreAccess(storeId, cancellationToken);
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = db.Menus.AsNoTracking().Where(menu => menu.StoreId == storeId);
        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(menu => menu.UpdatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(menu => new MenuSummaryDto(menu.Id, menu.StoreId, menu.Name, menu.Slug, menu.Status.ToString(), menu.Categories.Count, menu.Categories.SelectMany(category => category.Products).Count(), menu.PublishedAt))
            .ToListAsync(cancellationToken);
        return new PagedResult<MenuSummaryDto>(items, page, pageSize, total);
    }

    public async Task<MenuDto> GetAsync(Guid menuId, CancellationToken cancellationToken) => Map(await AuthorizedMenu(menuId, true, cancellationToken));

    public async Task<MenuDto> CreateAsync(Guid storeId, CreateMenuRequest request, CancellationToken cancellationToken)
    {
        await EnsureStoreAccess(storeId, cancellationToken);
        var plan = await PlanForStore(storeId, cancellationToken);
        if (await db.Menus.CountAsync(menu => menu.StoreId == storeId && menu.Status != MenuStatus.Archived, cancellationToken) >= plan.MaxPublishedMenus)
        {
            throw new InvalidOperationException("Seu plano permite apenas um cardápio ativo.");
        }
        var normalized = Domain.Common.Slug.Normalize(request.Slug);
        if (await db.Menus.AnyAsync(menu => menu.Slug == normalized, cancellationToken)) throw new InvalidOperationException("Este slug já está em uso.");
        var menu = new Menu(storeId, request.Name, normalized);
        menu.SetDetails(request.Name, normalized, request.Description);
        db.Menus.Add(menu);
        await db.SaveChangesAsync(cancellationToken);
        return Map(menu);
    }

    public async Task<MenuDto> UpdateAsync(Guid menuId, UpdateMenuRequest request, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        var normalized = Domain.Common.Slug.Normalize(request.Slug);
        if (await db.Menus.AnyAsync(item => item.Slug == normalized && item.Id != menuId, cancellationToken)) throw new InvalidOperationException("Este slug já está em uso.");
        menu.SetDetails(request.Name, normalized, request.Description);
        await db.SaveChangesAsync(cancellationToken);
        return Map(menu);
    }

    public async Task<MenuDto> PublishAsync(Guid menuId, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        var user = await userManager.FindByIdAsync(UserId().ToString()) ?? throw new UnauthorizedAccessException();
        menu.Publish(user.EmailConfirmed);
        db.AuditLogs.Add(new AuditLog(user.Id, "menu.published", nameof(Menu), menu.Id, CorrelationId()));
        await db.SaveChangesAsync(cancellationToken);
        return Map(menu);
    }

    public async Task ArchiveAsync(Guid menuId, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        menu.Archive();
        db.AuditLogs.Add(new AuditLog(UserId(), "menu.archived", nameof(Menu), menu.Id, CorrelationId()));
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<CategoryDto> AddCategoryAsync(Guid menuId, CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        var order = menu.Categories.Count == 0 ? 0 : menu.Categories.Max(category => category.SortOrder) + 1;
        var category = new MenuCategory(menu.Id, request.Name, request.Description, order);
        db.MenuCategories.Add(category);
        menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
        return Map(category);
    }

    public async Task<CategoryDto> UpdateCategoryAsync(Guid categoryId, UpdateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await AuthorizedCategory(categoryId, cancellationToken);
        category.Update(request.Name, request.Description, request.IsActive);
        category.Menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
        return Map(category);
    }

    public async Task DeleteCategoryAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        var category = await AuthorizedCategory(categoryId, cancellationToken);
        db.MenuCategories.Remove(category);
        category.Menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderCategoriesAsync(Guid menuId, ReorderRequest request, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        ValidateOrder(request, menu.Categories.Select(category => category.Id));
        foreach (var item in request.Items) menu.Categories.Single(category => category.Id == item.Id).Reorder(item.Order);
        menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ProductDto> AddProductAsync(Guid menuId, CreateProductRequest request, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        var category = menu.Categories.SingleOrDefault(item => item.Id == request.CategoryId) ?? throw new KeyNotFoundException("Categoria não encontrada.");
        var plan = await PlanForStore(menu.StoreId, cancellationToken);
        if (menu.Categories.SelectMany(item => item.Products).Count() >= plan.MaxProducts) throw new InvalidOperationException("Limite de produtos do plano atingido.");
        var order = category.Products.Count == 0 ? 0 : category.Products.Max(product => product.SortOrder) + 1;
        var product = new Product(category.Id, request.Name, request.Description, request.Price, request.PromotionalPrice, order);
        db.Products.Add(product);
        menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
        return Map(product);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid productId, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await AuthorizedProduct(productId, cancellationToken);
        product.Update(request.Name, request.Description, request.Price, request.PromotionalPrice, request.IsAvailable, request.IsFeatured);
        product.Category.Menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
        return Map(product);
    }

    public async Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await AuthorizedProduct(productId, cancellationToken);
        db.Products.Remove(product);
        product.Category.Menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderProductsAsync(Guid menuId, ReorderRequest request, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        var products = menu.Categories.SelectMany(category => category.Products).ToList();
        ValidateOrder(request, products.Select(product => product.Id));
        foreach (var item in request.Items) products.Single(product => product.Id == item.Id).Reorder(item.Order);
        menu.Touch();
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ThemeDto> UpdateThemeAsync(Guid menuId, UpdateThemeRequest request, CancellationToken cancellationToken)
    {
        var menu = await AuthorizedMenu(menuId, true, cancellationToken);
        menu.Theme.Update(request.Preset, request.PrimaryColor, request.SecondaryColor, request.BackgroundColor, request.Style);
        menu.Touch();
        db.AuditLogs.Add(new AuditLog(UserId(), "menu.theme_updated", nameof(Menu), menu.Id, CorrelationId()));
        await db.SaveChangesAsync(cancellationToken);
        return Map(menu.Theme);
    }

    public async Task<PublicMenuDto?> GetPublicAsync(string slug, CancellationToken cancellationToken)
    {
        var normalized = Domain.Common.Slug.Normalize(slug);
        var menu = await MenuQuery().AsNoTracking()
            .SingleOrDefaultAsync(item => item.Slug == normalized && item.Status == MenuStatus.Published, cancellationToken);
        if (menu is null) return null;
        var categories = menu.Categories.Where(category => category.IsActive).OrderBy(category => category.SortOrder)
            .Select(category => new PublicCategoryDto(category.Name, category.Description, category.Products.Where(product => product.IsAvailable).OrderBy(product => product.SortOrder).Select(MapPublic).ToList())).ToList();
        return new PublicMenuDto(menu.Store.PublicName, menu.Name, menu.Description, menu.Slug, Url(menu.Store.LogoFile), Map(menu.Theme), categories, PublicUpdatedAt(menu));
    }

    public async Task<PublicProductDetailDto?> GetPublicProductAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await db.Products.AsNoTracking()
            .Include(item => item.Images).ThenInclude(image => image.File)
            .Include(item => item.Category).ThenInclude(category => category.Menu).ThenInclude(menu => menu.Theme)
            .Include(item => item.Category).ThenInclude(category => category.Menu).ThenInclude(menu => menu.Store).ThenInclude(store => store.LogoFile)
            .SingleOrDefaultAsync(item => item.Id == productId && item.IsAvailable && item.Category.IsActive && item.Category.Menu.Status == MenuStatus.Published, cancellationToken);
        if (product is null) return null;

        var category = product.Category;
        var menu = category.Menu;
        return new PublicProductDetailDto(menu.Store.PublicName, menu.Name, menu.Slug, Url(menu.Store.LogoFile), Map(menu.Theme), category.Name, MapPublic(product), PublicUpdatedAt(menu));
    }

    private IQueryable<Menu> MenuQuery() => db.Menus
        .Include(menu => menu.Store).ThenInclude(store => store.LogoFile)
        .Include(menu => menu.Theme)
        .Include(menu => menu.Categories).ThenInclude(category => category.Products).ThenInclude(product => product.Images).ThenInclude(image => image.File);

    private async Task<Menu> AuthorizedMenu(Guid menuId, bool tracked, CancellationToken cancellationToken)
    {
        var query = MenuQuery().Where(menu => menu.Id == menuId && menu.Store.Members.Any(member => member.UserId == UserId()));
        if (!tracked) query = query.AsNoTracking();
        return await query.SingleOrDefaultAsync(cancellationToken) ?? throw new UnauthorizedAccessException("Cardápio não encontrado ou sem acesso.");
    }

    private async Task<MenuCategory> AuthorizedCategory(Guid categoryId, CancellationToken cancellationToken)
        => await db.MenuCategories.Include(category => category.Menu).Include(category => category.Products).ThenInclude(product => product.Images).ThenInclude(image => image.File)
            .SingleOrDefaultAsync(category => category.Id == categoryId && category.Menu.Store.Members.Any(member => member.UserId == UserId()), cancellationToken)
            ?? throw new UnauthorizedAccessException("Categoria não encontrada ou sem acesso.");

    private async Task<Product> AuthorizedProduct(Guid productId, CancellationToken cancellationToken)
        => await db.Products.Include(product => product.Category).ThenInclude(category => category.Menu).Include(product => product.Images).ThenInclude(image => image.File)
            .SingleOrDefaultAsync(product => product.Id == productId && product.Category.Menu.Store.Members.Any(member => member.UserId == UserId()), cancellationToken)
            ?? throw new UnauthorizedAccessException("Produto não encontrado ou sem acesso.");

    private async Task EnsureStoreAccess(Guid storeId, CancellationToken cancellationToken)
    {
        if (!await db.StoreMembers.AnyAsync(member => member.StoreId == storeId && member.UserId == UserId(), cancellationToken)) throw new UnauthorizedAccessException("Loja não encontrada ou sem acesso.");
    }

    private async Task<Plan> PlanForStore(Guid storeId, CancellationToken cancellationToken)
        => await db.Subscriptions.Where(subscription => subscription.StoreId == storeId && subscription.Status == SubscriptionStatus.Active)
            .Select(subscription => subscription.Plan).SingleAsync(cancellationToken);

    private static void ValidateOrder(ReorderRequest request, IEnumerable<Guid> validIds)
    {
        var ids = validIds.ToHashSet();
        var requestedIds = request.Items.Select(item => item.Id).ToHashSet();
        if (request.Items.Count == 0 || request.Items.Count != requestedIds.Count || !ids.SetEquals(requestedIds) || request.Items.Any(item => item.Order < 0))
            throw new InvalidOperationException("Ordenação inválida.");
    }

    private MenuDto Map(Menu menu) => new(menu.Id, menu.StoreId, menu.Name, menu.Slug, menu.Description, menu.Currency, menu.Status.ToString(), menu.PublishedAt, Map(menu.Theme), menu.Categories.OrderBy(category => category.SortOrder).Select(Map).ToList());
    private CategoryDto Map(MenuCategory category) => new(category.Id, category.Name, category.Description, category.SortOrder, category.IsActive, category.Products.OrderBy(product => product.SortOrder).Select(Map).ToList());
    private ProductDto Map(Product product)
    {
        var main = product.Images.FirstOrDefault(image => image.Variant == "main")?.File;
        var thumb = product.Images.FirstOrDefault(image => image.Variant == "thumbnail")?.File;
        return new ProductDto(product.Id, product.CategoryId, product.Name, product.Description, product.Price, product.PromotionalPrice, product.IsAvailable, product.IsFeatured, product.SortOrder, Url(main), Url(thumb));
    }
    private PublicProductDto MapPublic(Product product)
    {
        var main = product.Images.FirstOrDefault(image => image.Variant == "main")?.File;
        var thumb = product.Images.FirstOrDefault(image => image.Variant == "thumbnail")?.File;
        return new PublicProductDto(product.Id, product.Name, product.Description, product.Price, product.PromotionalPrice, product.IsFeatured, Url(main), Url(thumb));
    }
    private static ThemeDto Map(MenuTheme theme) => new(theme.Preset, theme.PrimaryColor, theme.SecondaryColor, theme.BackgroundColor, theme.Style);
    private static DateTimeOffset PublicUpdatedAt(Menu menu) => menu.Store.UpdatedAt > menu.UpdatedAt ? menu.Store.UpdatedAt : menu.UpdatedAt;
    private string? Url(Domain.Stores.StoredFile? file) => file is null ? null : storage.GetPublicUrl(file.StorageKey);
    private Guid UserId() => currentUser.Id ?? throw new UnauthorizedAccessException("Autenticação necessária.");
    private string CorrelationId() => httpContextAccessor.HttpContext?.TraceIdentifier ?? Guid.CreateVersion7().ToString("N");
}
