using QrPortal.Domain.Common;

namespace QrPortal.Domain.Identity;

public sealed class TermsAcceptance : Entity
{
    private TermsAcceptance() { }

    public TermsAcceptance(
        Guid userId,
        string termsVersion,
        string? ipAddress,
        decimal? latitude,
        decimal? longitude,
        decimal? accuracyMeters)
    {
        UserId = userId;
        TermsVersion = termsVersion?.Trim() ?? string.Empty;
        IpAddress = string.IsNullOrWhiteSpace(ipAddress) ? null : ipAddress.Trim();
        if (TermsVersion.Length is 0 or > 32) throw new DomainException("Versão dos termos inválida.");
        if (IpAddress?.Length > 45) throw new DomainException("Endereço IP inválido.");
        if (latitude is < -90 or > 90 || longitude is < -180 or > 180)
            throw new DomainException("Localização inválida.");
        if ((latitude is null) != (longitude is null)) throw new DomainException("Localização incompleta.");
        if (accuracyMeters is < 0 or > 100000) throw new DomainException("Precisão da localização inválida.");

        // A evidência de aceite precisa apenas de uma referência regional, não da posição exata.
        Latitude = latitude is null ? null : decimal.Round(latitude.Value, 2);
        Longitude = longitude is null ? null : decimal.Round(longitude.Value, 2);
        AccuracyMeters = accuracyMeters is null ? null : decimal.Round(accuracyMeters.Value, 0);
        AcceptedAt = DateTimeOffset.UtcNow;
    }

    public Guid UserId { get; private set; }
    public string TermsVersion { get; private set; } = string.Empty;
    public DateTimeOffset AcceptedAt { get; private set; }
    public string? IpAddress { get; private set; }
    public decimal? Latitude { get; private set; }
    public decimal? Longitude { get; private set; }
    public decimal? AccuracyMeters { get; private set; }
}
