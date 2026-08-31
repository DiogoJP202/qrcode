using QrPortal.Domain.Common;
using QrPortal.Domain.Identity;
using QrPortal.Domain.Menus;
using QrPortal.Domain.Stores;

namespace QrPortal.UnitTests;

public sealed class DomainRulesTests
{
    [Theory]
    [InlineData("Café do João", "cafe-do-joao")]
    [InlineData("  Minha--Loja  ", "minha-loja")]
    [InlineData("Açaí & Cia", "acai-cia")]
    public void Slug_is_normalized(string input, string expected)
        => Assert.Equal(expected, Slug.Normalize(input));

    [Theory]
    [InlineData("api")]
    [InlineData("m")]
    [InlineData("ab")]
    public void Reserved_or_short_slug_is_rejected(string input)
        => Assert.Throws<DomainException>(() => Slug.Normalize(input));

    [Fact]
    public void Promotional_price_cannot_be_greater_than_regular_price()
        => Assert.Throws<DomainException>(() => new Product(Guid.CreateVersion7(), "Prato", null, 20m, 21m, 0));

    [Fact]
    public void Product_rounds_prices_to_two_decimal_places()
    {
        var product = new Product(Guid.CreateVersion7(), "Prato", null, 20.126m, 18.555m, 0);

        Assert.Equal(20.13m, product.Price);
        Assert.Equal(18.56m, product.PromotionalPrice);
    }

    [Fact]
    public void Publishing_requires_a_confirmed_email()
    {
        var menu = MenuWithAvailableProduct();

        var exception = Assert.Throws<DomainException>(() => menu.Publish(emailConfirmed: false));

        Assert.Contains("Confirme", exception.Message);
    }

    [Fact]
    public void Publishing_requires_an_active_category_with_available_product()
    {
        var menu = new Menu(Guid.CreateVersion7(), "Almoço", "almoco");

        Assert.Throws<DomainException>(() => menu.Publish(emailConfirmed: true));
    }

    [Fact]
    public void Valid_menu_can_be_published()
    {
        var menu = MenuWithAvailableProduct();

        menu.Publish(emailConfirmed: true);

        Assert.Equal(MenuStatus.Published, menu.Status);
        Assert.NotNull(menu.PublishedAt);
    }

    [Fact]
    public void Theme_normalizes_hex_colors()
    {
        var theme = MenuTheme.CreateDefault(Guid.CreateVersion7());

        theme.Update("dark", "#aabbcc", "#123456", "#ffffff", "rounded", "serif", "list", "contain");

        Assert.Equal("#AABBCC", theme.PrimaryColor);
        Assert.Equal("#FFFFFF", theme.BackgroundColor);
        Assert.Equal("serif", theme.FontFamily);
        Assert.Equal("list", theme.CardLayout);
        Assert.Equal("contain", theme.ImageStyle);
    }

    [Fact]
    public void Terms_acceptance_minimizes_optional_location_precision()
    {
        var acceptance = new TermsAcceptance(
            Guid.CreateVersion7(),
            "2026-08-31",
            "203.0.113.42",
            -23.550520m,
            -46.633308m,
            127.6m);

        Assert.Equal(-23.55m, acceptance.Latitude);
        Assert.Equal(-46.63m, acceptance.Longitude);
        Assert.Equal(128m, acceptance.AccuracyMeters);
        Assert.Equal("203.0.113.42", acceptance.IpAddress);
        Assert.True(DateTimeOffset.UtcNow - acceptance.AcceptedAt < TimeSpan.FromSeconds(2));
    }

    [Theory]
    [InlineData(-91, 0)]
    [InlineData(91, 0)]
    [InlineData(0, -181)]
    [InlineData(0, 181)]
    public void Terms_acceptance_rejects_invalid_location(decimal latitude, decimal longitude)
        => Assert.Throws<DomainException>(() => new TermsAcceptance(Guid.CreateVersion7(), "2026-08-31", null, latitude, longitude, null));

    [Fact]
    public void Business_presentation_requires_content_before_publication()
    {
        var store = new Store(Guid.CreateVersion7(), "Casa Manjericão", "casa-manjericao");

        Assert.Throws<DomainException>(() => store.SetPresentation(
            null, null, null, null, null, null, null, null, null,
            "#16a34a", "#f8fafc", "#0f172a", "modern", isPublished: true));
    }

    [Fact]
    public void Business_presentation_normalizes_safe_customization()
    {
        var store = new Store(Guid.CreateVersion7(), "Casa Manjericão", "casa-manjericao");

        store.SetPresentation(
            "A cozinha do bairro",
            "Ingredientes locais e receitas da família.",
            "(11) 3333-4444",
            "5511999999999",
            "contato@exemplo.com",
            "Rua das Flores, 10",
            "Segunda a sábado, 11h às 22h",
            "https://exemplo.com",
            "https://instagram.com/exemplo",
            "#16a34a", "#f8fafc", "#0f172a", "classic", isPublished: true);

        Assert.True(store.IsPresentationPublished);
        Assert.Equal("#16A34A", store.PresentationPrimaryColor);
        Assert.Equal("classic", store.PresentationStyle);
    }

    private static Menu MenuWithAvailableProduct()
    {
        var menu = new Menu(Guid.CreateVersion7(), "Almoço", "almoco");
        var category = new MenuCategory(menu.Id, "Pratos", null, 0);
        category.Products.Add(new Product(category.Id, "Executivo", null, 29.9m, null, 0));
        menu.Categories.Add(category);
        return menu;
    }
}
