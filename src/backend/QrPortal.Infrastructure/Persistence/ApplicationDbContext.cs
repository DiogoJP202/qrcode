using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using QrPortal.Domain.Common;
using QrPortal.Domain.Identity;
using QrPortal.Domain.Menus;
using QrPortal.Domain.Plans;
using QrPortal.Domain.Stores;
using QrPortal.Infrastructure.Identity;

namespace QrPortal.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<StoreMember> StoreMembers => Set<StoreMember>();
    public DbSet<Menu> Menus => Set<Menu>();
    public DbSet<MenuCategory> MenuCategories => Set<MenuCategory>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();
    public DbSet<MenuTheme> MenuThemes => Set<MenuTheme>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<TermsAcceptance> TermsAcceptances => Set<TermsAcceptance>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasPostgresExtension("citext");

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.FullName).HasMaxLength(150).IsRequired();
            entity.Property(user => user.CreatedAt).HasColumnType("timestamptz");
            entity.Property(user => user.UpdatedAt).HasColumnType("timestamptz");
        });

        builder.Entity<Store>(entity =>
        {
            entity.ToTable("Stores");
            entity.HasKey(store => store.Id);
            entity.Property(store => store.PublicName).HasMaxLength(120).IsRequired();
            entity.Property(store => store.Slug).HasColumnType("citext").HasMaxLength(80).IsRequired();
            entity.Property(store => store.Description).HasMaxLength(500);
            entity.Property(store => store.PresentationHeadline).HasMaxLength(160);
            entity.Property(store => store.PresentationAbout).HasMaxLength(2000);
            entity.Property(store => store.ContactPhone).HasMaxLength(30);
            entity.Property(store => store.WhatsApp).HasMaxLength(30);
            entity.Property(store => store.ContactEmail).HasMaxLength(254);
            entity.Property(store => store.Address).HasMaxLength(300);
            entity.Property(store => store.BusinessHours).HasMaxLength(500);
            entity.Property(store => store.WebsiteUrl).HasMaxLength(300);
            entity.Property(store => store.InstagramUrl).HasMaxLength(300);
            entity.Property(store => store.PresentationPrimaryColor).HasMaxLength(7).HasDefaultValue("#16A34A");
            entity.Property(store => store.PresentationBackgroundColor).HasMaxLength(7).HasDefaultValue("#F8FAFC");
            entity.Property(store => store.PresentationTextColor).HasMaxLength(7).HasDefaultValue("#0F172A");
            entity.Property(store => store.PresentationStyle).HasMaxLength(16).HasDefaultValue("modern");
            entity.HasIndex(store => store.Slug).IsUnique();
            entity.HasOne(store => store.LogoFile).WithMany().HasForeignKey(store => store.LogoFileId).OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<StoreMember>(entity =>
        {
            entity.ToTable("StoreMembers");
            entity.HasKey(member => new { member.StoreId, member.UserId });
            entity.HasOne(member => member.Store).WithMany(store => store.Members).HasForeignKey(member => member.StoreId);
            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(member => member.UserId).OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(member => member.UserId);
        });

        builder.Entity<Menu>(entity =>
        {
            entity.ToTable("Menus", table => table.HasCheckConstraint("CK_Menus_Currency", "char_length(\"Currency\") = 3"));
            entity.HasKey(menu => menu.Id);
            entity.Property(menu => menu.Name).HasMaxLength(120).IsRequired();
            entity.Property(menu => menu.Slug).HasColumnType("citext").HasMaxLength(80).IsRequired();
            entity.Property(menu => menu.Description).HasMaxLength(500);
            entity.Property(menu => menu.Currency).HasMaxLength(3).IsFixedLength().IsRequired();
            entity.HasIndex(menu => menu.Slug).IsUnique();
            entity.HasIndex(menu => new { menu.StoreId, menu.Status });
            entity.HasOne(menu => menu.Store).WithMany(store => store.Menus).HasForeignKey(menu => menu.StoreId);
        });

        builder.Entity<MenuCategory>(entity =>
        {
            entity.ToTable("MenuCategories", table => table.HasCheckConstraint("CK_MenuCategories_SortOrder", "\"SortOrder\" >= 0"));
            entity.HasKey(category => category.Id);
            entity.Property(category => category.Name).HasMaxLength(80).IsRequired();
            entity.Property(category => category.Description).HasMaxLength(240);
            entity.HasIndex(category => new { category.MenuId, category.SortOrder });
            entity.HasOne(category => category.Menu).WithMany(menu => menu.Categories).HasForeignKey(category => category.MenuId);
        });

        builder.Entity<Product>(entity =>
        {
            entity.ToTable("Products", table =>
            {
                table.HasCheckConstraint("CK_Products_Price", "\"Price\" >= 0");
                table.HasCheckConstraint("CK_Products_PromotionalPrice", "\"PromotionalPrice\" IS NULL OR (\"PromotionalPrice\" >= 0 AND \"PromotionalPrice\" <= \"Price\")");
                table.HasCheckConstraint("CK_Products_SortOrder", "\"SortOrder\" >= 0");
            });
            entity.HasKey(product => product.Id);
            entity.Property(product => product.Name).HasMaxLength(120).IsRequired();
            entity.Property(product => product.Description).HasMaxLength(1000);
            entity.Property(product => product.Price).HasPrecision(12, 2);
            entity.Property(product => product.PromotionalPrice).HasPrecision(12, 2);
            entity.HasIndex(product => new { product.CategoryId, product.SortOrder });
            entity.HasOne(product => product.Category).WithMany(category => category.Products).HasForeignKey(product => product.CategoryId);
        });

        builder.Entity<StoredFile>(entity =>
        {
            entity.ToTable("StoredFiles");
            entity.HasKey(file => file.Id);
            entity.Property(file => file.StorageKey).HasMaxLength(300).IsRequired();
            entity.Property(file => file.ContentType).HasMaxLength(100).IsRequired();
            entity.Property(file => file.Variant).HasMaxLength(32).IsRequired();
            entity.Property(file => file.Checksum).HasMaxLength(64).IsRequired();
            entity.HasIndex(file => file.StorageKey).IsUnique();
            entity.HasIndex(file => file.OwnerId);
            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(file => file.OwnerId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ProductImage>(entity =>
        {
            entity.ToTable("ProductImages");
            entity.HasKey(image => new { image.ProductId, image.Variant });
            entity.Property(image => image.Variant).HasMaxLength(32);
            entity.HasOne(image => image.Product).WithMany(product => product.Images).HasForeignKey(image => image.ProductId);
            entity.HasOne(image => image.File).WithMany().HasForeignKey(image => image.FileId).OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<MenuTheme>(entity =>
        {
            entity.ToTable("MenuThemes");
            entity.HasKey(theme => theme.Id);
            entity.HasIndex(theme => theme.MenuId).IsUnique();
            entity.Property(theme => theme.Preset).HasMaxLength(32);
            entity.Property(theme => theme.PrimaryColor).HasMaxLength(7);
            entity.Property(theme => theme.SecondaryColor).HasMaxLength(7);
            entity.Property(theme => theme.BackgroundColor).HasMaxLength(7);
            entity.Property(theme => theme.Style).HasMaxLength(16);
            entity.Property(theme => theme.FontFamily).HasMaxLength(16).HasDefaultValue("sans");
            entity.Property(theme => theme.CardLayout).HasMaxLength(16).HasDefaultValue("grid");
            entity.Property(theme => theme.ImageStyle).HasMaxLength(16).HasDefaultValue("cover");
            entity.HasOne(theme => theme.Menu).WithOne(menu => menu.Theme).HasForeignKey<MenuTheme>(theme => theme.MenuId);
        });

        builder.Entity<Plan>(entity =>
        {
            entity.ToTable("Plans");
            entity.HasKey(plan => plan.Id);
            entity.Property(plan => plan.Code).HasMaxLength(32).IsRequired();
            entity.Property(plan => plan.Name).HasMaxLength(80).IsRequired();
            entity.HasIndex(plan => plan.Code).IsUnique();
            entity.HasData(new
            {
                Id = Guid.Parse("01970000-0000-7000-8000-000000000001"),
                Code = "free",
                Name = "Free",
                MaxStores = 1,
                MaxPublishedMenus = 1,
                MaxProducts = 100,
                CreatedAt = DateTimeOffset.UnixEpoch,
                UpdatedAt = DateTimeOffset.UnixEpoch
            });
        });

        builder.Entity<Subscription>(entity =>
        {
            entity.ToTable("Subscriptions");
            entity.HasKey(subscription => subscription.Id);
            entity.HasIndex(subscription => new { subscription.StoreId, subscription.Status });
            entity.HasOne(subscription => subscription.Store).WithMany().HasForeignKey(subscription => subscription.StoreId);
            entity.HasOne(subscription => subscription.Plan).WithMany().HasForeignKey(subscription => subscription.PlanId);
        });

        builder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs");
            entity.HasKey(log => log.Id);
            entity.Property(log => log.EventName).HasMaxLength(120);
            entity.Property(log => log.ResourceType).HasMaxLength(80);
            entity.Property(log => log.CorrelationId).HasMaxLength(100);
            entity.HasIndex(log => new { log.ResourceType, log.ResourceId });
            entity.HasIndex(log => log.CreatedAt);
        });

        builder.Entity<TermsAcceptance>(entity =>
        {
            entity.ToTable("TermsAcceptances");
            entity.HasKey(acceptance => acceptance.Id);
            entity.Property(acceptance => acceptance.TermsVersion).HasMaxLength(32).IsRequired();
            entity.Property(acceptance => acceptance.AcceptedAt).HasColumnType("timestamptz");
            entity.Property(acceptance => acceptance.IpAddress).HasMaxLength(45);
            entity.Property(acceptance => acceptance.Latitude).HasPrecision(6, 3);
            entity.Property(acceptance => acceptance.Longitude).HasPrecision(6, 3);
            entity.Property(acceptance => acceptance.AccuracyMeters).HasPrecision(8, 0);
            entity.HasIndex(acceptance => new { acceptance.UserId, acceptance.TermsVersion }).IsUnique();
            entity.HasOne<ApplicationUser>().WithMany().HasForeignKey(acceptance => acceptance.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Entity>().Where(entry => entry.State == EntityState.Modified))
        {
            entry.Property(nameof(Entity.UpdatedAt)).CurrentValue = now;
        }
        foreach (var entry in ChangeTracker.Entries<ApplicationUser>().Where(entry => entry.State == EntityState.Modified))
        {
            entry.Entity.UpdatedAt = now;
        }
        return await base.SaveChangesAsync(cancellationToken);
    }
}
