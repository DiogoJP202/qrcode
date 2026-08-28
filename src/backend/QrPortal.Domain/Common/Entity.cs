namespace QrPortal.Domain.Common;

public abstract class Entity
{
    protected Entity() => Id = Guid.CreateVersion7();

    public Guid Id { get; protected set; }
    public DateTimeOffset CreatedAt { get; protected set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; protected set; } = DateTimeOffset.UtcNow;

    public void Touch() => UpdatedAt = DateTimeOffset.UtcNow;
}

public sealed class DomainException(string message) : Exception(message);
