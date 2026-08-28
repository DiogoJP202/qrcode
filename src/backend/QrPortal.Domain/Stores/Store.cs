using QrPortal.Domain.Common;
using QrPortal.Domain.Menus;

namespace QrPortal.Domain.Stores;

public enum StoreRole
{
    Owner = 1,
    Editor = 2
}

public sealed class Store : Entity
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
