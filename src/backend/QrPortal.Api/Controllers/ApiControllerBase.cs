using Microsoft.AspNetCore.Mvc;
using QrPortal.Application.Contracts;

namespace QrPortal.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult FromResult(OperationResult result)
        => result.Succeeded ? NoContent() : ApiProblem(result.Code ?? "validation_error", result.Errors ?? []);

    protected ActionResult<T> FromResult<T>(OperationResult<T> result)
        => result.Succeeded && result.Value is not null ? Ok(result.Value) : ApiProblem(result.Code ?? "validation_error", result.Errors ?? []);

    protected ObjectResult ApiProblem(string code, IReadOnlyList<string> errors, int status = 400)
    {
        var problem = new ProblemDetails { Status = status, Title = "Não foi possível concluir a operação.", Type = $"https://qrportal.com/problems/{code}" };
        problem.Extensions["code"] = code;
        problem.Extensions["errors"] = errors;
        problem.Extensions["traceId"] = HttpContext.TraceIdentifier;
        return StatusCode(status, problem);
    }
}
