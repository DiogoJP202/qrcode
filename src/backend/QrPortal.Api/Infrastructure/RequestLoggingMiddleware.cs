using System.Diagnostics;
using System.Security.Claims;

namespace QrPortal.Api.Infrastructure;

public sealed class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var startedAt = Stopwatch.GetTimestamp();
        await next(context);

        var elapsedMilliseconds = Stopwatch.GetElapsedTime(startedAt).TotalMilliseconds;
        var actorId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
        var requestRoute = (context.GetEndpoint() as Microsoft.AspNetCore.Routing.RouteEndpoint)?.RoutePattern.RawText ?? "unmatched";
        var level = context.Request.Path.StartsWithSegments("/health")
            ? LogLevel.Debug
            : context.Response.StatusCode >= 400 ? LogLevel.Warning : LogLevel.Information;

        logger.Log(
            level,
            "HTTP {RequestMethod} {RequestRoute} responded {StatusCode} in {ElapsedMilliseconds:F1} ms for {ActorId}. TraceId: {TraceId}",
            context.Request.Method,
            requestRoute,
            context.Response.StatusCode,
            elapsedMilliseconds,
            actorId,
            context.TraceIdentifier);
    }
}
