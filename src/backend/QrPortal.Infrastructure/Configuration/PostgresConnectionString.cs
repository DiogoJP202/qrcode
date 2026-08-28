using Npgsql;

namespace QrPortal.Infrastructure.Configuration;

public static class PostgresConnectionString
{
    public static string Normalize(string connectionString)
    {
        if (!connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
            && !connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
        {
            return connectionString;
        }

        if (!Uri.TryCreate(connectionString, UriKind.Absolute, out var uri))
        {
            throw new InvalidOperationException("A URL de conexão PostgreSQL é inválida.");
        }

        var credentials = uri.UserInfo.Split(':', 2);
        var database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
        if (credentials.Length != 2 || string.IsNullOrWhiteSpace(uri.Host) || string.IsNullOrWhiteSpace(database))
        {
            throw new InvalidOperationException("A URL de conexão PostgreSQL está incompleta.");
        }

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Username = Uri.UnescapeDataString(credentials[0]),
            Password = Uri.UnescapeDataString(credentials[1]),
            Database = database,
            IncludeErrorDetail = false,
            LogParameters = false
        };

        foreach (var (key, value) in ParseQuery(uri.Query))
        {
            if (key.Equals("sslmode", StringComparison.OrdinalIgnoreCase)
                && Enum.TryParse<SslMode>(value.Replace("-", string.Empty, StringComparison.Ordinal), true, out var sslMode))
            {
                builder.SslMode = sslMode;
            }
            else if (key.Equals("channel_binding", StringComparison.OrdinalIgnoreCase)
                     && Enum.TryParse<ChannelBinding>(value, true, out var channelBinding))
            {
                builder.ChannelBinding = channelBinding;
            }
        }

        return builder.ConnectionString;
    }

    private static IEnumerable<(string Key, string Value)> ParseQuery(string query)
    {
        foreach (var segment in query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var pair = segment.Split('=', 2);
            if (pair.Length == 2)
            {
                yield return (Uri.UnescapeDataString(pair[0]), Uri.UnescapeDataString(pair[1]));
            }
        }
    }
}
