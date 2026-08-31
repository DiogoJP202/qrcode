# Banco de dados

PostgreSQL é a fonte transacional. Chaves de negócio usam UUID v7 gerados pela aplicação; timestamps são `timestamptz` em UTC.

## Entidades iniciais

- `AspNetUsers`: Identity; nome completo, telefone, e-mail normalizado e confirmação.
- `TermsAcceptances`: usuário, versão dos documentos, instante UTC, IP e localização aproximada opcional da evidência de aceite.
- `Stores`: nome público, slug, descrição, logo, apresentação pública, contatos, cores/estilo e timestamps.
- `StoreMembers`: usuário, loja e papel (`Owner`, `Editor`).
- `Menus`: loja, nome, descrição, slug, moeda, status e publicação.
- `MenuCategories`: menu, nome, descrição, ordem e ativo.
- `Products`: categoria, nome, descrição, preços, disponibilidade, destaque e ordem.
- `StoredFiles`: owner, chave, MIME, variante, bytes, dimensões e checksum.
- `ProductImages`: produto, arquivo e papel da variante.
- `MenuThemes`: menu, preset, cores, estilo, tipografia, layout dos cards e encaixe de imagem.
- `Plans`: código, limites e recursos.
- `Subscriptions`: loja, plano, status e vigência.
- `AuditLogs`: ator, evento, recurso, correlação e timestamp.

## Restrições

- slugs normalizados e únicos;
- preço não negativo e promocional menor ou igual ao preço normal;
- moeda ISO de três caracteres, inicialmente `BRL`;
- índices por foreign key, status, slug e ordem;
- uma membership por `(StoreId, UserId)`;
- um aceite por `(UserId, TermsVersion)`;
- um tema por menu; a assinatura ativa é consultada por loja e terá índice exclusivo parcial antes dos planos pagos;
- exclusões em cascata apenas para filhos estritamente pertencentes ao agregado.

## Migrations

Migrations EF Core são versionadas no repositório e aplicadas em etapa controlada de deploy. Produção exige backup antes de migration destrutiva. Não há auto-migrate no startup de produção.

## Concorrência e datas

Escritas atualizam `UpdatedAt` no `DbContext`; mutações em conteúdo também tocam o cardápio pai para invalidar seu ETag. A API evita graph loading indiscriminado e pagina listagens privadas.

Em desenvolvimento, `ConnectionStrings__DefaultConnection` aceita tanto o formato ADO.NET/Npgsql (`Host=...;Username=...`) quanto a URL `postgresql://...` fornecida pelo Neon. A URL é normalizada antes de chegar ao driver e preserva `sslmode` e `channel_binding` quando informados.
