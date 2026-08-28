namespace QrPortal.Infrastructure.Configuration;

public static class DotEnvLoader
{
    public static string? LoadNearest(string startDirectory)
    {
        var current = new DirectoryInfo(Path.GetFullPath(startDirectory));
        while (current is not null)
        {
            var candidate = Path.Combine(current.FullName, ".env");
            if (File.Exists(candidate))
            {
                Load(candidate);
                return candidate;
            }

            if (Directory.Exists(Path.Combine(current.FullName, ".git"))) break;
            current = current.Parent;
        }

        return null;
    }

    public static void Load(string path)
    {
        foreach (var sourceLine in File.ReadLines(path))
        {
            var line = sourceLine.Trim().TrimStart('\uFEFF');
            if (line.Length == 0 || line.StartsWith('#')) continue;
            if (line.StartsWith("export ", StringComparison.OrdinalIgnoreCase)) line = line[7..].TrimStart();

            var separator = line.IndexOf('=');
            if (separator <= 0) continue;
            var key = line[..separator].Trim();
            if (!IsValidKey(key) || Environment.GetEnvironmentVariable(key) is not null) continue;

            var value = line[(separator + 1)..].Trim();
            if (value.Length >= 2 && ((value[0] == '"' && value[^1] == '"') || (value[0] == '\'' && value[^1] == '\'')))
            {
                value = value[1..^1];
            }

            Environment.SetEnvironmentVariable(key, value);
        }
    }

    private static bool IsValidKey(string key)
        => key.Length > 0
           && (char.IsLetter(key[0]) || key[0] == '_')
           && key.All(character => char.IsLetterOrDigit(character) || character == '_');
}
