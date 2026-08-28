namespace QrPortal.Infrastructure.Configuration;

public sealed class FrontendOptions
{
    public const string Section = "Frontend";
    public string Origin { get; set; } = "http://localhost:4200";
    public string PublicBaseUrl { get; set; } = "http://localhost:4200";
}

public sealed class EmailOptions
{
    public const string Section = "Email";
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1025;
    public bool UseSsl { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string SenderName { get; set; } = "QRPortal";
    public string SenderEmail { get; set; } = "no-reply@qrportal.local";
}

public sealed class StorageOptions
{
    public const string Section = "Storage";
    public string Provider { get; set; } = "Local";
    public string LocalRoot { get; set; } = "./data/uploads";
    public string PublicBaseUrl { get; set; } = "https://localhost:7245/files";
    public S3Options S3 { get; set; } = new();
}

public sealed class S3Options
{
    public string ServiceUrl { get; set; } = string.Empty;
    public string Bucket { get; set; } = "qrportal";
    public string Region { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
}
