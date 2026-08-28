using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using QrPortal.Application.Abstractions;
using QrPortal.Infrastructure.Configuration;
using QrPortal.Infrastructure.Email;
using QrPortal.Infrastructure.Identity;
using QrPortal.Infrastructure.Media;
using QrPortal.Infrastructure.Persistence;
using QrPortal.Infrastructure.Services;

namespace QrPortal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<FrontendOptions>(configuration.GetSection(FrontendOptions.Section));
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.Section));
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.Section));

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection não configurada.");
        services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));

        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedAccount = false;
            options.Password.RequiredLength = 10;
            options.Password.RequireDigit = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Tokens.EmailConfirmationTokenProvider = TokenOptions.DefaultEmailProvider;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "__Host-qrportal_session";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.Always;
            options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromHours(8);
            options.SlidingExpiration = true;
            options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; };
            options.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = 403; return Task.CompletedTask; };
        });
        services.Configure<DataProtectionTokenProviderOptions>(options => options.TokenLifespan = TimeSpan.FromHours(2));
        services.Configure<SecurityStampValidatorOptions>(options => options.ValidationInterval = TimeSpan.FromMinutes(15));

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IStoreService, StoreService>();
        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IMediaService, MediaService>();
        services.AddScoped<ITransactionalEmailSender, SmtpEmailSender>();
        services.AddSingleton<IImageProcessor, SkiaImageProcessor>();
        services.AddSingleton<IFileStorage>(provider =>
        {
            var options = provider.GetRequiredService<IOptions<StorageOptions>>().Value;
            return options.Provider.Equals("S3", StringComparison.OrdinalIgnoreCase)
                ? ActivatorUtilities.CreateInstance<S3CompatibleFileStorage>(provider)
                : ActivatorUtilities.CreateInstance<LocalFileStorage>(provider);
        });
        return services;
    }
}
