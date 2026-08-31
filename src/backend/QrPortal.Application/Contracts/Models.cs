namespace QrPortal.Application.Contracts;

public sealed record OperationResult(bool Succeeded, string? Code = null, IReadOnlyList<string>? Errors = null)
{
    public static OperationResult Ok() => new(true);
    public static OperationResult Fail(string code, params string[] errors) => new(false, code, errors);
}

public sealed record OperationResult<T>(bool Succeeded, T? Value = default, string? Code = null, IReadOnlyList<string>? Errors = null)
{
    public static OperationResult<T> Ok(T value) => new(true, value);
    public static OperationResult<T> Fail(string code, params string[] errors) => new(false, default, code, errors);
}

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int Total);

public static class LegalDocumentVersions
{
    public const string CurrentTerms = "2026-08-31";
}

public sealed record RegisterRequest(
    string FullName,
    string PhoneNumber,
    string Email,
    string Password,
    bool AcceptTerms,
    string TermsVersion,
    decimal? Latitude = null,
    decimal? Longitude = null,
    decimal? LocationAccuracyMeters = null);
public sealed record ExternalRegistrationRequest(
    string FullName,
    string PhoneNumber,
    bool AcceptTerms,
    string TermsVersion,
    decimal? Latitude = null,
    decimal? Longitude = null,
    decimal? LocationAccuracyMeters = null);
public sealed record LoginRequest(string Email, string Password, bool RememberMe = false);
public sealed record ConfirmEmailRequest(Guid UserId, string Token);
public sealed record ForgotPasswordRequest(string Email);
public sealed record ResetPasswordRequest(Guid UserId, string Token, string NewPassword);
public sealed record UpdateProfileRequest(string FullName, string PhoneNumber);
public sealed record UserSessionDto(Guid Id, string Email, bool EmailConfirmed, string FullName, string? PhoneNumber, bool HasAcceptedCurrentTerms);
public sealed record ExternalLoginPendingDto(string Email, string? SuggestedName);
public sealed record AuthenticationProvidersDto(bool Google);

public sealed record CreateStoreRequest(string PublicName, string Slug, string? Description = null);
public sealed record UpdateStoreRequest(string PublicName, string Slug, string? Description = null);
public sealed record UpdateStorePresentationRequest(
    string? Headline,
    string? About,
    string? ContactPhone,
    string? WhatsApp,
    string? ContactEmail,
    string? Address,
    string? BusinessHours,
    string? WebsiteUrl,
    string? InstagramUrl,
    string PrimaryColor,
    string BackgroundColor,
    string TextColor,
    string Style,
    bool IsPublished);
public sealed record StoreDto(
    Guid Id,
    string PublicName,
    string Slug,
    string? Description,
    string? LogoUrl,
    string Role,
    string? PresentationHeadline,
    string? PresentationAbout,
    string? ContactPhone,
    string? WhatsApp,
    string? ContactEmail,
    string? Address,
    string? BusinessHours,
    string? WebsiteUrl,
    string? InstagramUrl,
    string PresentationPrimaryColor,
    string PresentationBackgroundColor,
    string PresentationTextColor,
    string PresentationStyle,
    bool IsPresentationPublished);
public sealed record PublicStoreDto(
    string PublicName,
    string Slug,
    string? LogoUrl,
    string Headline,
    string About,
    string? ContactPhone,
    string? WhatsApp,
    string? ContactEmail,
    string? Address,
    string? BusinessHours,
    string? WebsiteUrl,
    string? InstagramUrl,
    string PrimaryColor,
    string BackgroundColor,
    string TextColor,
    string Style,
    string? PublishedMenuSlug,
    DateTimeOffset UpdatedAt);

public sealed record CreateMenuRequest(string Name, string Slug, string? Description = null);
public sealed record UpdateMenuRequest(string Name, string Slug, string? Description = null);
public sealed record MenuSummaryDto(Guid Id, Guid StoreId, string Name, string Slug, string Status, int CategoryCount, int ProductCount, DateTimeOffset? PublishedAt);
public sealed record MenuDto(Guid Id, Guid StoreId, string Name, string Slug, string? Description, string Currency, string Status, DateTimeOffset? PublishedAt, ThemeDto Theme, IReadOnlyList<CategoryDto> Categories);

public sealed record CreateCategoryRequest(string Name, string? Description = null);
public sealed record UpdateCategoryRequest(string Name, string? Description, bool IsActive);
public sealed record ReorderItemRequest(Guid Id, int Order);
public sealed record ReorderRequest(IReadOnlyList<ReorderItemRequest> Items);
public sealed record CategoryDto(Guid Id, string Name, string? Description, int Order, bool IsActive, IReadOnlyList<ProductDto> Products);

public sealed record CreateProductRequest(Guid CategoryId, string Name, string? Description, decimal Price, decimal? PromotionalPrice = null);
public sealed record UpdateProductRequest(string Name, string? Description, decimal Price, decimal? PromotionalPrice, bool IsAvailable, bool IsFeatured);
public sealed record ProductDto(Guid Id, Guid CategoryId, string Name, string? Description, decimal Price, decimal? PromotionalPrice, bool IsAvailable, bool IsFeatured, int Order, string? ImageUrl, string? ThumbnailUrl);

public sealed record UpdateThemeRequest(string Preset, string PrimaryColor, string SecondaryColor, string BackgroundColor, string Style, string FontFamily, string CardLayout, string ImageStyle);
public sealed record ThemeDto(string Preset, string PrimaryColor, string SecondaryColor, string BackgroundColor, string Style, string FontFamily, string CardLayout, string ImageStyle);

public sealed record OnboardingDto(string Step, Guid? StoreId, Guid? MenuId, Guid? CategoryId, bool CanPublish);
public sealed record UploadResultDto(Guid MainFileId, Guid ThumbnailFileId, string ImageUrl, string ThumbnailUrl);

public sealed record PublicMenuDto(string StoreName, string MenuName, string? Description, string Slug, string? LogoUrl, ThemeDto Theme, IReadOnlyList<PublicCategoryDto> Categories, DateTimeOffset UpdatedAt);
public sealed record PublicCategoryDto(string Name, string? Description, IReadOnlyList<PublicProductDto> Products);
public sealed record PublicProductDto(Guid Id, string Name, string? Description, decimal Price, decimal? PromotionalPrice, bool IsFeatured, string? ImageUrl, string? ThumbnailUrl);
public sealed record PublicProductDetailDto(string StoreName, string MenuName, string MenuSlug, string? LogoUrl, ThemeDto Theme, string CategoryName, PublicProductDto Product, DateTimeOffset UpdatedAt);
