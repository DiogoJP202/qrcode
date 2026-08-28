using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using QrPortal.Application.Abstractions;
using QrPortal.Application.Contracts;
using QrPortal.Domain.Menus;
using QrPortal.Domain.Stores;
using QrPortal.Infrastructure.Persistence;

namespace QrPortal.Infrastructure.Services;

public sealed class MediaService(ApplicationDbContext db, ICurrentUser currentUser, IImageProcessor processor, IFileStorage storage, ILogger<MediaService> logger) : IMediaService
{
    public async Task<UploadResultDto> SetProductImageAsync(Guid productId, Stream content, string contentType, long length, CancellationToken cancellationToken)
    {
        var userId = UserId();
        var product = await db.Products.Include(item => item.Category).ThenInclude(category => category.Menu).Include(item => item.Images).ThenInclude(image => image.File)
            .SingleOrDefaultAsync(item => item.Id == productId && item.Category.Menu.Store.Members.Any(member => member.UserId == userId), cancellationToken)
            ?? throw new UnauthorizedAccessException("Produto não encontrado ou sem acesso.");
        var image = processor.ProcessProduct(content, contentType, length);
        var prefix = $"users/{userId:N}/products/{productId:N}/{Guid.CreateVersion7():N}";
        var mainKey = $"{prefix}-main.webp";
        var thumbnailKey = $"{prefix}-thumbnail.webp";
        await PutPair(mainKey, image.Main, thumbnailKey, image.Thumbnail, cancellationToken);

        var mainFile = File(userId, mainKey, "main", image.Main, image.MainWidth, image.MainHeight);
        var thumbnailFile = File(userId, thumbnailKey, "thumbnail", image.Thumbnail, image.ThumbnailWidth, image.ThumbnailHeight);
        var oldFiles = product.Images.Select(item => item.File).ToList();
        db.ProductImages.RemoveRange(product.Images);
        db.StoredFiles.AddRange(mainFile, thumbnailFile);
        db.ProductImages.AddRange(new ProductImage(product.Id, mainFile.Id, "main"), new ProductImage(product.Id, thumbnailFile.Id, "thumbnail"));
        db.StoredFiles.RemoveRange(oldFiles);
        product.Category.Menu.Touch();
        try { await db.SaveChangesAsync(cancellationToken); }
        catch
        {
            await SafeDelete(mainKey, cancellationToken);
            await SafeDelete(thumbnailKey, cancellationToken);
            throw;
        }
        foreach (var old in oldFiles) await SafeDelete(old.StorageKey, cancellationToken);
        return new UploadResultDto(mainFile.Id, thumbnailFile.Id, storage.GetPublicUrl(mainKey), storage.GetPublicUrl(thumbnailKey));
    }

    public async Task<string> SetStoreLogoAsync(Guid storeId, Stream content, string contentType, long length, CancellationToken cancellationToken)
    {
        var userId = UserId();
        var store = await db.Stores.Include(item => item.LogoFile).Include(item => item.Menus)
            .SingleOrDefaultAsync(item => item.Id == storeId && item.Members.Any(member => member.UserId == userId), cancellationToken)
            ?? throw new UnauthorizedAccessException("Loja não encontrada ou sem acesso.");
        var image = processor.ProcessLogo(content, contentType, length);
        var key = $"users/{userId:N}/stores/{storeId:N}/{Guid.CreateVersion7():N}-logo.webp";
        await storage.PutAsync(key, new MemoryStream(image.Main, writable: false), "image/webp", cancellationToken);
        var file = File(userId, key, "logo", image.Main, image.MainWidth, image.MainHeight);
        var old = store.LogoFile;
        db.StoredFiles.Add(file);
        store.SetLogo(file.Id);
        foreach (var menu in store.Menus) menu.Touch();
        if (old is not null) db.StoredFiles.Remove(old);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch { await SafeDelete(key, cancellationToken); throw; }
        if (old is not null) await SafeDelete(old.StorageKey, cancellationToken);
        return storage.GetPublicUrl(key);
    }

    private async Task PutPair(string mainKey, byte[] main, string thumbnailKey, byte[] thumbnail, CancellationToken cancellationToken)
    {
        await storage.PutAsync(mainKey, new MemoryStream(main, writable: false), "image/webp", cancellationToken);
        try { await storage.PutAsync(thumbnailKey, new MemoryStream(thumbnail, writable: false), "image/webp", cancellationToken); }
        catch { await storage.DeleteAsync(mainKey, cancellationToken); throw; }
    }

    private static StoredFile File(Guid ownerId, string key, string variant, byte[] content, int width, int height)
        => new(ownerId, key, "image/webp", variant, content.LongLength, width, height, Convert.ToHexString(SHA256.HashData(content)).ToLowerInvariant());
    private async Task SafeDelete(string key, CancellationToken cancellationToken)
    {
        try { await storage.DeleteAsync(key, cancellationToken); }
        catch (Exception exception) { logger.LogWarning(exception, "Could not delete storage object {StorageKey}", key); }
    }
    private Guid UserId() => currentUser.Id ?? throw new UnauthorizedAccessException("Autenticação necessária.");
}
