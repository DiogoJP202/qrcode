using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace QrPortal.Domain.Common;

public static partial class Slug
{
    private static readonly HashSet<string> Reserved = new(StringComparer.OrdinalIgnoreCase)
    {
        "api", "app", "admin", "login", "cadastro", "planos", "sobre", "contato", "m"
    };

    public static string Normalize(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException("O slug é obrigatório.");
        }

        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);
        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        var slug = InvalidCharacters().Replace(builder.ToString().Normalize(NormalizationForm.FormC), "-").Trim('-');
        slug = DuplicateHyphens().Replace(slug, "-");
        if (slug.Length is < 3 or > 80 || Reserved.Contains(slug))
        {
            throw new DomainException("Escolha um slug entre 3 e 80 caracteres que não seja reservado.");
        }

        return slug;
    }

    [GeneratedRegex("[^a-z0-9]+", RegexOptions.Compiled)]
    private static partial Regex InvalidCharacters();

    [GeneratedRegex("-{2,}", RegexOptions.Compiled)]
    private static partial Regex DuplicateHyphens();
}
