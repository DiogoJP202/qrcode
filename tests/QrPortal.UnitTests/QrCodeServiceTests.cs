using QrPortal.Infrastructure.Media;

namespace QrPortal.UnitTests;

public sealed class QrCodeServiceTests
{
    private readonly QrCodeService service = new();

    [Fact]
    public void Png_has_the_expected_file_signature()
    {
        var png = service.GeneratePng("https://qrportal.com/p/01981234-5678-7000-8000-000000000001");

        Assert.True(png.Length > 100);
        Assert.Equal(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }, png[..8]);
    }

    [Fact]
    public void Svg_is_a_scalable_qr_image()
    {
        var svg = service.GenerateSvg("https://qrportal.com/p/01981234-5678-7000-8000-000000000001");

        Assert.StartsWith("<svg", svg, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("viewBox=", svg, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Empty_payload_is_rejected()
        => Assert.Throws<ArgumentException>(() => service.GenerateSvg(" "));
}
