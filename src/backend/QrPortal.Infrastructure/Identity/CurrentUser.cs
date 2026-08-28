using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using QrPortal.Application.Abstractions;

namespace QrPortal.Infrastructure.Identity;

public sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid? Id => Guid.TryParse(accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
    public bool IsAuthenticated => accessor.HttpContext?.User.Identity?.IsAuthenticated == true;
}
