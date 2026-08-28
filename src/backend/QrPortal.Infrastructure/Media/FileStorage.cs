using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using QrPortal.Application.Abstractions;
using QrPortal.Infrastructure.Configuration;

namespace QrPortal.Infrastructure.Media;

public sealed class LocalFileStorage(IOptions<StorageOptions> options) : IFileStorage
{
    private readonly StorageOptions _options = options.Value;

    public async Task PutAsync(string key, Stream content, string contentType, CancellationToken cancellationToken)
    {
        var (_, destination) = Resolve(key);
        Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
        var temporary = destination + ".tmp-" + Guid.NewGuid().ToString("N");
        try
        {
            await using (var output = File.Create(temporary)) await content.CopyToAsync(output, cancellationToken);
            File.Move(temporary, destination, overwrite: true);
        }
        finally
        {
            if (File.Exists(temporary)) File.Delete(temporary);
        }
    }

    public Task DeleteAsync(string key, CancellationToken cancellationToken)
    {
        var (_, destination) = Resolve(key);
        if (File.Exists(destination)) File.Delete(destination);
        return Task.CompletedTask;
    }

    public string GetPublicUrl(string key) => $"{_options.PublicBaseUrl.TrimEnd('/')}/{key}";

    private (string Root, string Destination) Resolve(string key)
    {
        if (string.IsNullOrWhiteSpace(key) || Path.IsPathRooted(key)) throw new InvalidOperationException("Chave de storage inválida.");
        var root = Path.TrimEndingDirectorySeparator(Path.GetFullPath(_options.LocalRoot));
        var destination = Path.GetFullPath(Path.Combine(root, key.Replace('/', Path.DirectorySeparatorChar)));
        var rootPrefix = root + Path.DirectorySeparatorChar;
        if (!destination.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase)) throw new InvalidOperationException("Chave de storage inválida.");
        return (root, destination);
    }
}

public sealed class S3CompatibleFileStorage : IFileStorage, IDisposable
{
    private readonly StorageOptions _options;
    private readonly AmazonS3Client _client;

    public S3CompatibleFileStorage(IOptions<StorageOptions> options)
    {
        _options = options.Value;
        _client = new AmazonS3Client(_options.S3.AccessKey, _options.S3.SecretKey, new AmazonS3Config
        {
            ServiceURL = _options.S3.ServiceUrl,
            AuthenticationRegion = string.IsNullOrWhiteSpace(_options.S3.Region) ? null : _options.S3.Region,
            ForcePathStyle = true
        });
    }

    public Task PutAsync(string key, Stream content, string contentType, CancellationToken cancellationToken)
        => _client.PutObjectAsync(new PutObjectRequest { BucketName = _options.S3.Bucket, Key = key, InputStream = content, ContentType = contentType }, cancellationToken);

    public Task DeleteAsync(string key, CancellationToken cancellationToken)
        => _client.DeleteObjectAsync(_options.S3.Bucket, key, cancellationToken);

    public string GetPublicUrl(string key) => $"{_options.PublicBaseUrl.TrimEnd('/')}/{key}";
    public void Dispose() => _client.Dispose();
}
