using System.Text;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using QrPortal.Application.Abstractions;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Api.Controllers;

// QR Codes das páginas institucionais de exemplo. O conteúdo do exemplo vive no
// frontend, mas o código precisa sair do mesmo gerador dos produtos reais para que
// a demonstração mostre exatamente o que o cliente vai imprimir.
[Route("api/v1/public/example")]
public sealed partial class PublicExampleController(IQrCodeService qrCodes, IOptions<FrontendOptions> frontendOptions) : ApiControllerBase
{
    [HttpGet("{slug}/qr.{format:regex(^(svg|png)$)}")]
    [AllowAnonymous]
    [EnableRateLimiting("public-menu")]
    public IActionResult GetProductQr(string slug, string format, [FromQuery] bool download)
    {
        // O slug é restrito para que o endpoint só codifique endereços do próprio
        // domínio: não é um gerador de QR Code para conteúdo arbitrário.
        if (!ExampleSlug().IsMatch(slug)) return NotFound();

        var url = $"{frontendOptions.Value.PublicBaseUrl.TrimEnd('/')}/exemplo/{slug}";
        Response.Headers.CacheControl = "public,max-age=3600";
        var fileName = $"qr-exemplo-{slug}.{format}";

        if (format.Equals("png", StringComparison.OrdinalIgnoreCase))
        {
            var png = qrCodes.GeneratePng(url);
            return download ? File(png, "image/png", fileName) : File(png, "image/png");
        }

        var svg = Encoding.UTF8.GetBytes(qrCodes.GenerateSvg(url));
        return download ? File(svg, "image/svg+xml", fileName) : File(svg, "image/svg+xml");
    }

    [GeneratedRegex("^[a-z0-9][a-z0-9-]{0,48}$", RegexOptions.Compiled)]
    private static partial Regex ExampleSlug();
}
