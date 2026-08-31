using QRCoder;
using QrPortal.Application.Abstractions;

namespace QrPortal.Infrastructure.Media;

public sealed class QrCodeService : IQrCodeService
{
    public byte[] GeneratePng(string payload)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(payload);
        return PngByteQRCodeHelper.GetQRCode(payload, QRCodeGenerator.ECCLevel.Q, 16);
    }

    public string GenerateSvg(string payload)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(payload);
        using var data = QRCodeGenerator.GenerateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
        using var renderer = new SvgQRCode(data);
        return renderer.GetGraphic(12);
    }
}
