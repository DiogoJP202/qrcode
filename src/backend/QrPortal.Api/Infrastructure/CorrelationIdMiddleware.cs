namespace QrPortal.Api.Infrastructure;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    public const string HeaderName = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        var supplied = context.Request.Headers[HeaderName].FirstOrDefault();
        var correlationId = IsValid(supplied) ? supplied! : Guid.CreateVersion7().ToString("N");

        context.TraceIdentifier = correlationId;
        context.Response.Headers[HeaderName] = correlationId;
        await next(context);
    }

    internal static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length > 64) return false;
        return value.All(character => char.IsAsciiLetterOrDigit(character) || character is '-' or '_' or '.');
    }
}
