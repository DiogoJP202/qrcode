using QrPortal.Domain.Common;
using QrPortal.Domain.Menus;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace QrPortal.Domain.Stores;

public enum StoreRole
{
    Owner = 1,
    Editor = 2
}

public sealed partial class Store : Entity
{
    private Store() { }

    public Store(Guid ownerId, string publicName, string slug)
    {
        SetProfile(publicName, slug, null);
        Members.Add(new StoreMember(Id, ownerId, StoreRole.Owner));
    }

    public string PublicName { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? LogoFileId { get; private set; }
    public StoredFile? LogoFile { get; private set; }
    public string? PresentationHeadline { get; private set; }
    public string? PresentationAbout { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? WhatsApp { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? Address { get; private set; }
    public string? BusinessHours { get; private set; }
    public string? WebsiteUrl { get; private set; }
    public string? InstagramUrl { get; private set; }
    public string PresentationPrimaryColor { get; private set; } = "#16A34A";
    public string PresentationBackgroundColor { get; private set; } = "#F8FAFC";
    public string PresentationTextColor { get; private set; } = "#0F172A";
    public string PresentationStyle { get; private set; } = "modern";
    public bool IsPresentationPublished { get; private set; }
    public ICollection<StoreMember> Members { get; private set; } = new List<StoreMember>();
    public ICollection<Menu> Menus { get; private set; } = new List<Menu>();

    public void SetProfile(string publicName, string slug, string? description)
    {
        PublicName = Required(publicName, 120, "nome público");
        Slug = Common.Slug.Normalize(slug);
        Description = Optional(description, 500);
        Touch();
    }

    public void SetLogo(Guid? fileId)
    {
        LogoFileId = fileId;
        Touch();
    }

    public void SetPresentation(
        string? headline,
        string? about,
        string? contactPhone,
        string? whatsApp,
        string? contactEmail,
        string? address,
        string? businessHours,
        string? websiteUrl,
        string? instagramUrl,
        string primaryColor,
        string backgroundColor,
        string textColor,
        string style,
        bool isPublished)
    {
        PresentationHeadline = Optional(headline, 160);
        PresentationAbout = Optional(about, 2000);
        ContactPhone = Optional(contactPhone, 30);
        WhatsApp = Optional(whatsApp, 30);
        ContactEmail = Optional(contactEmail, 254);
        Address = Optional(address, 300);
        BusinessHours = Optional(businessHours, 500);
        WebsiteUrl = SafeUrl(websiteUrl, "site");
        InstagramUrl = SafeUrl(instagramUrl, "Instagram");
        PresentationPrimaryColor = Color(primaryColor);
        PresentationBackgroundColor = Color(backgroundColor);
        PresentationTextColor = Color(textColor);
        PresentationStyle = style is "modern" or "classic" or "bold" ? style : throw new DomainException("Estilo da apresentação inválido.");
        if (ContactEmail is not null && !MailAddress.TryCreate(ContactEmail, out _)) throw new DomainException("E-mail público inválido.");
        if (isPublished && (PresentationHeadline is null || PresentationAbout is null))
            throw new DomainException("Adicione um título e uma apresentação antes de publicar a página do negócio.");
        IsPresentationPublished = isPublished;
        Touch();
    }

    private static string Required(string value, int maxLength, string field)
    {
        var result = value?.Trim() ?? string.Empty;
        if (result.Length is 0 || result.Length > maxLength)
        {
            throw new DomainException($"O {field} deve ter entre 1 e {maxLength} caracteres.");
        }
        return result;
    }

    private static string? Optional(string? value, int maxLength)
    {
        var result = string.IsNullOrWhiteSpace(value) ? null : value.Trim();
        if (result?.Length > maxLength) throw new DomainException($"O texto deve ter no máximo {maxLength} caracteres.");
        return result;
    }

    private static string? SafeUrl(string? value, string field)
    {
        var result = Optional(value, 300);
        if (result is null) return null;
        if (!Uri.TryCreate(result, UriKind.Absolute, out var uri) || uri.Scheme is not ("http" or "https"))
            throw new DomainException($"URL de {field} inválida.");
        return uri.ToString();
    }

    private static string Color(string value)
    {
        var color = value?.Trim().ToUpperInvariant() ?? string.Empty;
        if (!HexColor().IsMatch(color)) throw new DomainException("Cor HEX inválida.");
        return color;
    }

    [GeneratedRegex("^#[0-9A-F]{6}$", RegexOptions.Compiled)]
    private static partial Regex HexColor();
}

public sealed class StoreMember
{
    private StoreMember() { }
    public StoreMember(Guid storeId, Guid userId, StoreRole role) => (StoreId, UserId, Role) = (storeId, userId, role);

    public Guid StoreId { get; private set; }
    public Store Store { get; private set; } = null!;
    public Guid UserId { get; private set; }
    public StoreRole Role { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
}

public sealed class StoredFile : Entity
{
    private StoredFile() { }

    public StoredFile(Guid ownerId, string storageKey, string contentType, string variant, long length, int width, int height, string checksum)
    {
        OwnerId = ownerId;
        StorageKey = storageKey;
        ContentType = contentType;
        Variant = variant;
        Length = length;
        Width = width;
        Height = height;
        Checksum = checksum;
    }

    public Guid OwnerId { get; private set; }
    public string StorageKey { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public string Variant { get; private set; } = string.Empty;
    public long Length { get; private set; }
    public int Width { get; private set; }
    public int Height { get; private set; }
    public string Checksum { get; private set; } = string.Empty;
}
