using Microsoft.Extensions.Options;
using QrPortal.Infrastructure.Configuration;
using QrPortal.Infrastructure.Media;

namespace QrPortal.UnitTests;

public sealed class MediaSecurityTests
{
    [Fact]
    public void File_with_fake_image_signature_is_rejected()
    {
        var processor = new SkiaImageProcessor();
        var content = "this is not an image"u8.ToArray();

        Assert.Throws<InvalidDataException>(() => processor.ProcessProduct(new MemoryStream(content), "image/jpeg", content.Length));
    }

    [Fact]
    public void File_over_ten_megabytes_is_rejected_before_decoding()
    {
        var processor = new SkiaImageProcessor();

        Assert.Throws<InvalidDataException>(() => processor.ProcessProduct(Stream.Null, "image/png", 10 * 1024 * 1024 + 1));
    }

    [Fact]
    public void Reported_mime_must_match_the_file_signature()
    {
        var processor = new SkiaImageProcessor();
        var png = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");

        Assert.Throws<InvalidDataException>(() => processor.ProcessLogo(new MemoryStream(png), "image/jpeg", png.Length));
    }

    [Fact]
    public async Task Local_storage_rejects_path_traversal()
    {
        var root = Path.Combine(Path.GetTempPath(), $"qrportal-storage-{Guid.NewGuid():N}");
        var storage = new LocalFileStorage(Options.Create(new StorageOptions { LocalRoot = root }));

        await Assert.ThrowsAsync<InvalidOperationException>(() => storage.PutAsync("../escape.txt", Stream.Null, "text/plain", CancellationToken.None));
    }
}
