using Microsoft.Extensions.Configuration;

namespace QrPortal.Infrastructure.Configuration;

public static class StorageConfiguration
{
    public static bool ApplyAwsS3Compatibility(IConfiguration configuration)
    {
        var endpoint = configuration["AWS_ENDPOINT_URL_S3"];
        var accessKey = configuration["AWS_ACCESS_KEY_ID"];
        var secretKey = configuration["AWS_SECRET_ACCESS_KEY"];
        if (string.IsNullOrWhiteSpace(endpoint) || string.IsNullOrWhiteSpace(accessKey) || string.IsNullOrWhiteSpace(secretKey))
        {
            return false;
        }

        configuration["Storage:Provider"] = "S3";
        configuration["Storage:S3:ServiceUrl"] = endpoint.TrimEnd('/');
        configuration["Storage:S3:AccessKey"] = accessKey;
        configuration["Storage:S3:SecretKey"] = secretKey;
        configuration["Storage:S3:Region"] = configuration["AWS_REGION"] ?? string.Empty;

        var bucket = FirstConfigured(
            configuration["AWS_S3_BUCKET"],
            configuration["AWS_BUCKET_NAME"],
            configuration["S3_BUCKET_NAME"],
            configuration["Storage:S3:Bucket"]);
        if (!string.IsNullOrWhiteSpace(bucket)) configuration["Storage:S3:Bucket"] = bucket;

        var publicUrl = configuration["AWS_S3_PUBLIC_URL"];
        configuration["Storage:PublicBaseUrl"] = !string.IsNullOrWhiteSpace(publicUrl)
            ? publicUrl.TrimEnd('/')
            : !string.IsNullOrWhiteSpace(bucket)
                ? $"{endpoint.TrimEnd('/')}/{bucket}"
                : endpoint.TrimEnd('/');
        return true;
    }

    private static string? FirstConfigured(params string?[] values)
        => values.FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
}
