using System.Text.RegularExpressions;
using QrPortal.Domain.Common;
using QrPortal.Domain.Stores;

namespace QrPortal.Domain.Menus;

public enum MenuStatus
{
    Draft = 1,
    Published = 2,
    Archived = 3
}

public sealed class Menu : Entity
{
    private Menu() { }

    public Menu(Guid storeId, string name, string slug)
    {
        StoreId = storeId;
        SetDetails(name, slug, null);
        Theme = MenuTheme.CreateDefault(Id);
    }

    public Guid StoreId { get; private set; }
    public Store Store { get; private set; } = null!;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public string Currency { get; private set; } = "BRL";
    public MenuStatus Status { get; private set; } = MenuStatus.Draft;
    public DateTimeOffset? PublishedAt { get; private set; }
    public ICollection<MenuCategory> Categories { get; private set; } = new List<MenuCategory>();
    public MenuTheme Theme { get; private set; } = null!;

    public void SetDetails(string name, string slug, string? description)
    {
        Name = Required(name, 120, "nome do cardápio");
        Slug = Common.Slug.Normalize(slug);
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (Description?.Length > 500) throw new DomainException("A descrição deve ter no máximo 500 caracteres.");
        Touch();
    }

    public void Publish(bool emailConfirmed)
    {
        if (!emailConfirmed) throw new DomainException("Confirme seu e-mail antes de publicar.");
        if (!Categories.Any(category => category.IsActive && category.Products.Any(product => product.IsAvailable)))
        {
            throw new DomainException("Adicione ao menos uma categoria ativa com um produto disponível.");
        }
        Status = MenuStatus.Published;
        PublishedAt ??= DateTimeOffset.UtcNow;
        Touch();
    }

    public void Archive()
    {
        Status = MenuStatus.Archived;
        Touch();
    }

    private static string Required(string value, int maxLength, string field)
    {
        var result = value?.Trim() ?? string.Empty;
        if (result.Length is 0 || result.Length > maxLength) throw new DomainException($"O {field} deve ter entre 1 e {maxLength} caracteres.");
        return result;
    }
}

public sealed class MenuCategory : Entity
{
    private MenuCategory() { }

    public MenuCategory(Guid menuId, string name, string? description, int sortOrder)
    {
        MenuId = menuId;
        Update(name, description, true);
        SortOrder = sortOrder;
    }

    public Guid MenuId { get; private set; }
    public Menu Menu { get; private set; } = null!;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;
    public ICollection<Product> Products { get; private set; } = new List<Product>();

    public void Update(string name, string? description, bool isActive)
    {
        Name = name?.Trim() ?? string.Empty;
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (Name.Length is 0 or > 80 || Description?.Length > 240) throw new DomainException("Categoria inválida.");
        IsActive = isActive;
        Touch();
    }

    public void Reorder(int order)
    {
        if (order < 0) throw new DomainException("A ordem não pode ser negativa.");
        SortOrder = order;
        Touch();
    }
}

public sealed class Product : Entity
{
    private Product() { }

    public Product(Guid categoryId, string name, string? description, decimal price, decimal? promotionalPrice, int sortOrder)
    {
        CategoryId = categoryId;
        Update(name, description, price, promotionalPrice, true, false);
        SortOrder = sortOrder;
    }

    public Guid CategoryId { get; private set; }
    public MenuCategory Category { get; private set; } = null!;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public decimal? PromotionalPrice { get; private set; }
    public bool IsAvailable { get; private set; } = true;
    public bool IsFeatured { get; private set; }
    public int SortOrder { get; private set; }
    public ICollection<ProductImage> Images { get; private set; } = new List<ProductImage>();

    public void Update(string name, string? description, decimal price, decimal? promotionalPrice, bool isAvailable, bool isFeatured)
    {
        Name = name?.Trim() ?? string.Empty;
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (Name.Length is 0 or > 120 || Description?.Length > 1000) throw new DomainException("Produto inválido.");
        if (price < 0 || promotionalPrice < 0 || promotionalPrice > price) throw new DomainException("Preço inválido.");
        Price = decimal.Round(price, 2);
        PromotionalPrice = promotionalPrice is null ? null : decimal.Round(promotionalPrice.Value, 2);
        IsAvailable = isAvailable;
        IsFeatured = isFeatured;
        Touch();
    }

    public void Reorder(int order)
    {
        if (order < 0) throw new DomainException("A ordem não pode ser negativa.");
        SortOrder = order;
        Touch();
    }
}

public sealed class ProductImage
{
    private ProductImage() { }
    public ProductImage(Guid productId, Guid fileId, string variant) => (ProductId, FileId, Variant) = (productId, fileId, variant);
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;
    public Guid FileId { get; private set; }
    public StoredFile File { get; private set; } = null!;
    public string Variant { get; private set; } = string.Empty;
}

public sealed partial class MenuTheme : Entity
{
    private MenuTheme() { }
    private MenuTheme(Guid menuId) => MenuId = menuId;

    public Guid MenuId { get; private set; }
    public Menu Menu { get; private set; } = null!;
    public string Preset { get; private set; } = "green";
    public string PrimaryColor { get; private set; } = "#16A34A";
    public string SecondaryColor { get; private set; } = "#0F172A";
    public string BackgroundColor { get; private set; } = "#FFFFFF";
    public string Style { get; private set; } = "rounded";
    public string FontFamily { get; private set; } = "sans";
    public string CardLayout { get; private set; } = "grid";
    public string ImageStyle { get; private set; } = "cover";

    public static MenuTheme CreateDefault(Guid menuId) => new(menuId);

    public void Update(string preset, string primaryColor, string secondaryColor, string backgroundColor, string style, string fontFamily, string cardLayout, string imageStyle)
    {
        Preset = preset.Trim().ToLowerInvariant();
        PrimaryColor = Color(primaryColor);
        SecondaryColor = Color(secondaryColor);
        BackgroundColor = Color(backgroundColor);
        Style = style is "rounded" or "square" or "pill" ? style : throw new DomainException("Estilo inválido.");
        FontFamily = fontFamily is "sans" or "serif" or "rounded" ? fontFamily : throw new DomainException("Tipografia inválida.");
        CardLayout = cardLayout is "grid" or "list" ? cardLayout : throw new DomainException("Layout de produtos inválido.");
        ImageStyle = imageStyle is "cover" or "contain" ? imageStyle : throw new DomainException("Estilo de imagem inválido.");
        Touch();
    }

    private static string Color(string value)
    {
        var color = value.Trim().ToUpperInvariant();
        if (!HexColor().IsMatch(color)) throw new DomainException("Cor HEX inválida.");
        return color;
    }

    [GeneratedRegex("^#[0-9A-F]{6}$", RegexOptions.Compiled)]
    private static partial Regex HexColor();
}
