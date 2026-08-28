using QrPortal.Domain.Common;
using QrPortal.Domain.Stores;

namespace QrPortal.Domain.Plans;

public sealed class Plan : Entity
{
    private Plan() { }
    public Plan(string code, string name, int maxStores, int maxPublishedMenus, int maxProducts)
        => (Code, Name, MaxStores, MaxPublishedMenus, MaxProducts) = (code, name, maxStores, maxPublishedMenus, maxProducts);

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public int MaxStores { get; private set; }
    public int MaxPublishedMenus { get; private set; }
    public int MaxProducts { get; private set; }
}

public enum SubscriptionStatus { Active = 1, PastDue = 2, Canceled = 3 }

public sealed class Subscription : Entity
{
    private Subscription() { }
    public Subscription(Guid storeId, Guid planId) => (StoreId, PlanId) = (storeId, planId);
    public Guid StoreId { get; private set; }
    public Store Store { get; private set; } = null!;
    public Guid PlanId { get; private set; }
    public Plan Plan { get; private set; } = null!;
    public SubscriptionStatus Status { get; private set; } = SubscriptionStatus.Active;
    public DateTimeOffset StartedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? EndsAt { get; private set; }
}

public sealed class AuditLog : Entity
{
    private AuditLog() { }
    public AuditLog(Guid? actorId, string eventName, string resourceType, Guid? resourceId, string correlationId)
        => (ActorId, EventName, ResourceType, ResourceId, CorrelationId) = (actorId, eventName, resourceType, resourceId, correlationId);
    public Guid? ActorId { get; private set; }
    public string EventName { get; private set; } = string.Empty;
    public string ResourceType { get; private set; } = string.Empty;
    public Guid? ResourceId { get; private set; }
    public string CorrelationId { get; private set; } = string.Empty;
}
