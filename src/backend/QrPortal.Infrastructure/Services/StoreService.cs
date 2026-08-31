using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Domain.Plans;
using QrPortal.Domain.Stores;
using QrPortal.Infrastructure.Persistence;

namespace QrPortal.Infrastructure.Services;

public sealed class StoreService(ApplicationDbContext db, ICurrentUser currentUser, IFileStorage storage, IHttpContextAccessor httpContextAccessor) : IStoreService
{
    public async Task<PagedResult<StoreDto>> ListAsync(int page, int pageSize, CancellationToken cancellationToken)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var userId = UserId();
        var query = db.StoreMembers.AsNoTracking()
            .Where(member => member.UserId == userId)
            .Include(member => member.Store).ThenInclude(store => store.LogoFile);
        var total = await query.CountAsync(cancellationToken);
        var stores = await query.OrderBy(member => member.Store.PublicName)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync(cancellationToken);
        return new PagedResult<StoreDto>(stores.Select(member => Map(member.Store, member.Role.ToString())).ToList(), page, pageSize, total);
    }

    public async Task<StoreDto> GetAsync(Guid storeId, CancellationToken cancellationToken)
    {
        var member = await AuthorizedMember(storeId, cancellationToken);
        await db.Entry(member.Store).Reference(store => store.LogoFile).LoadAsync(cancellationToken);
        return Map(member.Store, member.Role.ToString());
    }

    public async Task<StoreDto> CreateAsync(CreateStoreRequest request, CancellationToken cancellationToken)
    {
        var userId = UserId();
        var normalized = Domain.Common.Slug.Normalize(request.Slug);
        var freePlan = await db.Plans.SingleAsync(plan => plan.Code == "free", cancellationToken);
        var storeCount = await db.StoreMembers.CountAsync(member => member.UserId == userId, cancellationToken);
        if (storeCount >= freePlan.MaxStores) throw new InvalidOperationException("Seu plano permite apenas uma loja.");
        if (await db.Stores.AnyAsync(store => store.Slug == normalized, cancellationToken)) throw new InvalidOperationException("Este slug já está em uso.");

        var store = new Store(userId, request.PublicName, normalized);
        store.SetProfile(request.PublicName, normalized, request.Description);
        db.Stores.Add(store);
        db.Subscriptions.Add(new Subscription(store.Id, freePlan.Id));
        db.AuditLogs.Add(new AuditLog(userId, "store.created", nameof(Store), store.Id, CorrelationId()));
        await db.SaveChangesAsync(cancellationToken);
        return Map(store, StoreRole.Owner.ToString());
    }

    public async Task<StoreDto> UpdateAsync(Guid storeId, UpdateStoreRequest request, CancellationToken cancellationToken)
    {
        var member = await AuthorizedMember(storeId, cancellationToken);
        var normalized = Domain.Common.Slug.Normalize(request.Slug);
        if (await db.Stores.AnyAsync(store => store.Slug == normalized && store.Id != storeId, cancellationToken)) throw new InvalidOperationException("Este slug já está em uso.");
        member.Store.SetProfile(request.PublicName, normalized, request.Description);
        db.AuditLogs.Add(new AuditLog(UserId(), "store.updated", nameof(Store), storeId, CorrelationId()));
        await db.SaveChangesAsync(cancellationToken);
        return Map(member.Store, member.Role.ToString());
    }

    public async Task<OnboardingDto> GetOnboardingAsync(CancellationToken cancellationToken)
    {
        var userId = UserId();
        var store = await db.Stores.AsNoTracking()
            .Where(item => item.Members.Any(member => member.UserId == userId))
            .Include(item => item.Menus).ThenInclude(menu => menu.Categories).ThenInclude(category => category.Products)
            .OrderBy(item => item.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (store is null) return new OnboardingDto("store", null, null, null, false);
        var menu = store.Menus.OrderBy(item => item.CreatedAt).FirstOrDefault();
        if (menu is null) return new OnboardingDto("menu", store.Id, null, null, false);
        var category = menu.Categories.OrderBy(item => item.SortOrder).FirstOrDefault();
        if (category is null) return new OnboardingDto("category", store.Id, menu.Id, null, false);
        if (category.Products.Count == 0) return new OnboardingDto("product", store.Id, menu.Id, category.Id, false);
        if (menu.Theme is null) return new OnboardingDto("appearance", store.Id, menu.Id, category.Id, false);
        return new OnboardingDto(menu.Status == Domain.Menus.MenuStatus.Published ? "complete" : "appearance", store.Id, menu.Id, category.Id, true);
    }

    private async Task<StoreMember> AuthorizedMember(Guid storeId, CancellationToken cancellationToken)
        => await db.StoreMembers.Include(member => member.Store).ThenInclude(store => store.LogoFile)
            .SingleOrDefaultAsync(member => member.StoreId == storeId && member.UserId == UserId(), cancellationToken)
            ?? throw new UnauthorizedAccessException("Você não possui acesso a esta loja.");

    private Guid UserId() => currentUser.Id ?? throw new UnauthorizedAccessException("Autenticação necessária.");
    private string CorrelationId() => httpContextAccessor.HttpContext?.TraceIdentifier ?? Guid.CreateVersion7().ToString("N");
    private StoreDto Map(Store store, string role) => new(store.Id, store.PublicName, store.Slug, store.Description, store.LogoFile is null ? null : storage.GetPublicUrl(store.LogoFile.StorageKey), role);
}
