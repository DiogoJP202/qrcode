using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrPortal.Domain.Common;
using QrPortal.Domain.Plans;
using QrPortal.Infrastructure.Persistence;

namespace QrPortal.Api.Infrastructure;

public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger, IServiceScopeFactory scopeFactory) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, code, log) = exception switch
        {
            DomainException => (400, "Dados inválidos", "domain_validation", false),
            InvalidDataException => (400, "Arquivo inválido", "invalid_file", false),
            KeyNotFoundException => (404, "Recurso não encontrado", "not_found", false),
            UnauthorizedAccessException => (404, "Recurso não encontrado", "not_found", false),
            InvalidOperationException => (409, "Operação não permitida", "conflict", false),
            DbUpdateException => (409, "Conflito de dados", "data_conflict", false),
            _ => (500, "Erro interno", "internal_error", true)
        };
        if (log) logger.LogError(exception, "Unhandled API error. TraceId: {TraceId}", context.TraceIdentifier);
        else if (exception is UnauthorizedAccessException)
        {
            var route = (context.GetEndpoint() as Microsoft.AspNetCore.Routing.RouteEndpoint)?.RoutePattern.RawText ?? "unmatched";
            logger.LogWarning("Authorization denied for {RequestRoute}. TraceId: {TraceId}", route, context.TraceIdentifier);
            await PersistAuthorizationFailure(context, cancellationToken);
        }

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = exception switch
            {
                DbUpdateException => "Os dados conflitam com um registro existente.",
                _ when status == 404 => "O recurso solicitado não foi encontrado.",
                _ when status == 500 => "Ocorreu um erro inesperado.",
                _ => exception.Message
            },
            Type = $"https://qrportal.com/problems/{code}"
        };
        problem.Extensions["code"] = code;
        problem.Extensions["traceId"] = context.TraceIdentifier;
        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(problem, options: null, contentType: "application/problem+json", cancellationToken: cancellationToken);
        return true;
    }

    private async Task PersistAuthorizationFailure(HttpContext context, CancellationToken cancellationToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var database = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            Guid? actorId = Guid.TryParse(context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
            database.AuditLogs.Add(new AuditLog(actorId, "authorization.denied", "Request", null, context.TraceIdentifier));
            await database.SaveChangesAsync(cancellationToken);
        }
        catch (Exception auditException)
        {
            logger.LogError(auditException, "Could not persist authorization audit. TraceId: {TraceId}", context.TraceIdentifier);
        }
    }
}
