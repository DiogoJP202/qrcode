using SkiaSharp;
using QrPortal.Application.Abstractions;

namespace QrPortal.Infrastructure.Media;

public sealed class SkiaImageProcessor : IImageProcessor
{
    private const long MaxBytes = 10 * 1024 * 1024;
    private const int MaxDimension = 6000;
    private const long MaxPixels = 36_000_000;

    public ProcessedImage ProcessProduct(Stream input, string contentType, long length) => Process(input, contentType, length, 1200, 400, 82, 76);
    public ProcessedImage ProcessLogo(Stream input, string contentType, long length) => Process(input, contentType, length, 512, 192, 86, 80);

    private static ProcessedImage Process(Stream input, string contentType, long length, int mainLimit, int thumbnailLimit, int mainQuality, int thumbnailQuality)
    {
        if (length is <= 0 or > MaxBytes) throw new InvalidDataException("A imagem deve ter no máximo 10 MB.");
        using var memory = new MemoryStream();
        input.CopyTo(memory);
        var bytes = memory.ToArray();
        var reportedType = contentType.Split(';', 2)[0].Trim().ToLowerInvariant();
        var detectedType = DetectContentType(bytes);
        if (bytes.LongLength != length || detectedType is null || reportedType != detectedType) throw new InvalidDataException("Formato ou MIME de imagem inválido.");

        using var codec = SKCodec.Create(new SKMemoryStream(bytes)) ?? throw new InvalidDataException("Não foi possível decodificar a imagem.");
        var info = codec.Info;
        if (codec.FrameCount > 1) throw new InvalidDataException("Imagens animadas não são aceitas.");
        if (info.Width <= 0 || info.Height <= 0 || info.Width > MaxDimension || info.Height > MaxDimension || (long)info.Width * info.Height > MaxPixels)
        {
            throw new InvalidDataException("Dimensões de imagem excedem o limite.");
        }

        using var bitmap = SKBitmap.Decode(bytes) ?? throw new InvalidDataException("Não foi possível decodificar a imagem.");
        var main = ResizeAndEncode(bitmap, mainLimit, mainQuality);
        var thumbnail = ResizeAndEncode(bitmap, thumbnailLimit, thumbnailQuality);
        return new ProcessedImage(main.Bytes, main.Width, main.Height, thumbnail.Bytes, thumbnail.Width, thumbnail.Height);
    }

    private static (byte[] Bytes, int Width, int Height) ResizeAndEncode(SKBitmap source, int limit, int quality)
    {
        var scale = Math.Min(1d, (double)limit / Math.Max(source.Width, source.Height));
        var width = Math.Max(1, (int)Math.Round(source.Width * scale));
        var height = Math.Max(1, (int)Math.Round(source.Height * scale));
        using var resized = source.Resize(new SKImageInfo(width, height), new SKSamplingOptions(SKFilterMode.Linear, SKMipmapMode.Linear))
            ?? throw new InvalidDataException("Não foi possível redimensionar a imagem.");
        using var image = SKImage.FromBitmap(resized);
        using var data = image.Encode(SKEncodedImageFormat.Webp, quality);
        return (data.ToArray(), width, height);
    }

    private static string? DetectContentType(byte[] bytes)
    {
        if (bytes.Length < 12) return null;
        if (bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF) return "image/jpeg";
        if (bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47 && bytes[4] == 0x0D && bytes[5] == 0x0A && bytes[6] == 0x1A && bytes[7] == 0x0A) return "image/png";
        if (bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46 && bytes[8] == 0x57 && bytes[9] == 0x45 && bytes[10] == 0x42 && bytes[11] == 0x50) return "image/webp";
        return null;
    }
}
