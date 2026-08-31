using System.Security.Claims;
using QrPortal.Application.Contracts;

namespace QrPortal.Application.Abstractions;

public interface IIdentityService
{
    Task<OperationResult<UserSessionDto>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<OperationResult<UserSessionDto>> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task LogoutAsync(CancellationToken cancellationToken);
    Task<OperationResult> ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken);
    Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);
    Task<OperationResult> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
    Task<UserSessionDto?> GetCurrentAsync(CancellationToken cancellationToken);
    Task<OperationResult<UserSessionDto>> CompleteExternalLoginAsync(ClaimsPrincipal principal, CancellationToken cancellationToken);
}

public interface IStoreService
{
    Task<PagedResult<StoreDto>> ListAsync(int page, int pageSize, CancellationToken cancellationToken);
    Task<StoreDto> GetAsync(Guid storeId, CancellationToken cancellationToken);
    Task<StoreDto> CreateAsync(CreateStoreRequest request, CancellationToken cancellationToken);
    Task<StoreDto> UpdateAsync(Guid storeId, UpdateStoreRequest request, CancellationToken cancellationToken);
    Task<OnboardingDto> GetOnboardingAsync(CancellationToken cancellationToken);
}

public interface IMenuService
{
    Task<PagedResult<MenuSummaryDto>> ListAsync(Guid storeId, int page, int pageSize, CancellationToken cancellationToken);
    Task<MenuDto> GetAsync(Guid menuId, CancellationToken cancellationToken);
    Task<MenuDto> CreateAsync(Guid storeId, CreateMenuRequest request, CancellationToken cancellationToken);
    Task<MenuDto> UpdateAsync(Guid menuId, UpdateMenuRequest request, CancellationToken cancellationToken);
    Task<MenuDto> PublishAsync(Guid menuId, CancellationToken cancellationToken);
    Task ArchiveAsync(Guid menuId, CancellationToken cancellationToken);
    Task<CategoryDto> AddCategoryAsync(Guid menuId, CreateCategoryRequest request, CancellationToken cancellationToken);
    Task<CategoryDto> UpdateCategoryAsync(Guid categoryId, UpdateCategoryRequest request, CancellationToken cancellationToken);
    Task DeleteCategoryAsync(Guid categoryId, CancellationToken cancellationToken);
    Task ReorderCategoriesAsync(Guid menuId, ReorderRequest request, CancellationToken cancellationToken);
    Task<ProductDto> AddProductAsync(Guid menuId, CreateProductRequest request, CancellationToken cancellationToken);
    Task<ProductDto> UpdateProductAsync(Guid productId, UpdateProductRequest request, CancellationToken cancellationToken);
    Task DeleteProductAsync(Guid productId, CancellationToken cancellationToken);
    Task ReorderProductsAsync(Guid menuId, ReorderRequest request, CancellationToken cancellationToken);
    Task<ThemeDto> UpdateThemeAsync(Guid menuId, UpdateThemeRequest request, CancellationToken cancellationToken);
    Task<PublicMenuDto?> GetPublicAsync(string slug, CancellationToken cancellationToken);
    Task<PublicProductDetailDto?> GetPublicProductAsync(Guid productId, CancellationToken cancellationToken);
}

public interface IQrCodeService
{
    byte[] GeneratePng(string payload);
    string GenerateSvg(string payload);
}

public interface IMediaService
{
    Task<UploadResultDto> SetProductImageAsync(Guid productId, Stream content, string contentType, long length, CancellationToken cancellationToken);
    Task<string> SetStoreLogoAsync(Guid storeId, Stream content, string contentType, long length, CancellationToken cancellationToken);
}

public interface ICurrentUser
{
    Guid? Id { get; }
    bool IsAuthenticated { get; }
}

public interface ITransactionalEmailSender
{
    Task SendAsync(string recipient, string subject, string htmlBody, CancellationToken cancellationToken);
}

public interface IFileStorage
{
    Task PutAsync(string key, Stream content, string contentType, CancellationToken cancellationToken);
    Task DeleteAsync(string key, CancellationToken cancellationToken);
    string GetPublicUrl(string key);
}

public sealed record ProcessedImage(byte[] Main, int MainWidth, int MainHeight, byte[] Thumbnail, int ThumbnailWidth, int ThumbnailHeight);

public interface IImageProcessor
{
    ProcessedImage ProcessProduct(Stream input, string contentType, long length);
    ProcessedImage ProcessLogo(Stream input, string contentType, long length);
}
