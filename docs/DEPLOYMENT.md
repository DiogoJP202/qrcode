# Deploy e operação

## Topologia

- frontend Angular: arquivos estáticos em CDN/Vercel ou servidor equivalente;
- API: container ASP.NET Core em VPS/plataforma de containers;
- PostgreSQL: serviço gerenciado ou instância administrada;
- arquivos: S3, Cloudflare R2, MinIO ou compatível;
- e-mail: SMTP configurável.

## Ambientes

Desenvolvimento pode gravar e-mails em `data/emails` com `Email__Provider=LocalOutbox`, sem Mailpit. Para testar SMTP local, use Mailpit via Compose e altere o provedor para `Smtp`. Staging replica cookies HTTPS, CORS e S3. Produção usa SMTP, secrets do ambiente e migrations controladas.

## Pipeline

1. restore e verificação de lockfiles;
2. build e testes backend/frontend;
3. integration tests em PostgreSQL efêmero;
4. build de imagens/artefatos;
5. backup e migration;
6. deploy API e health check;
7. deploy frontend;
8. smoke test de login, publicação e menu público.

## Configurações

Documentar e fornecer exemplos para connection string, frontend origin, domínio público, Google OAuth, SMTP, S3 endpoint/bucket/credentials, `DataProtection__KeysPath` e proxies confiáveis. O diretório de chaves deve estar em volume persistente, gravável pelo usuário `app` do container. Nenhum secret é commitado.

O `.env` raiz é carregado automaticamente apenas em `Development`. Para Neon Object Storage, são aceitas as variáveis AWS geradas pelo serviço e as adicionais `AWS_S3_BUCKET` e `AWS_S3_PUBLIC_URL`. Produção deve fornecer os mesmos valores pelo gerenciador de secrets da plataforma, não por arquivo versionado.

No Google Cloud Console, cadastre `http://localhost:5043/signin-google` para desenvolvimento e `https://api.qrportal.com/signin-google` para produção. O Client ID e o Client Secret pertencem somente ao ambiente da API. Validar também a tela de consentimento, os domínios autorizados e o e-mail de suporte antes do smoke test.

O repositório inclui `src/backend/QrPortal.Api/Dockerfile` e `src/frontend/qrportal-web/Dockerfile`. A API roda como usuário não-root na porta 8080; o container web usa Nginx com fallback do Angular e headers de segurança. Antes do deploy:

```text
dotnet tool restore
dotnet tool run dotnet-ef migrations has-pending-model-changes --project src/backend/QrPortal.Infrastructure --startup-project src/backend/QrPortal.Api
dotnet tool run dotnet-ef database update --project src/backend/QrPortal.Infrastructure --startup-project src/backend/QrPortal.Api
```

O readiness check `/health/ready` consulta PostgreSQL e valida se storage/e-mail possuem configuração mínima completa; ele não grava no S3 nem envia e-mail. `/health/live` verifica apenas o processo. O endpoint retorna apenas o estado agregado, sem valores de configuração.

O proxy reverso deve encaminhar `X-Forwarded-For` e `X-Forwarded-Proto`. A API processa somente um salto e confia por padrão apenas em loopback. Outros endereços precisam ser declarados individualmente, por exemplo `ReverseProxy__KnownProxies__0=10.0.0.10`; nunca limpe a lista de proxies/redes conhecidas para confiar em qualquer origem.

## Rollback

Deploy da API mantém a versão anterior disponível. Migrations destrutivas exigem expansão/contração em releases separadas. Frontend é revertido por artefato imutável.

## Ambiente de demonstração (Render + Vercel)

Topologia validada para mostrar o produto sem infraestrutura própria: API em container no Render, frontend estático na Vercel, banco Neon e storage S3 já existentes. O repositório traz `render.yaml` e `vercel.json` com essa configuração.

O frontend **não** chama a API por domínio absoluto. `ApiClient.baseUrl` é o caminho relativo `/api/v1`, e a Vercel reescreve `/api/*` para o serviço do Render. Isso é obrigatório, não uma conveniência: os cookies de sessão e antiforgery usam `SameSite=Lax` com prefixo `__Host-`, e o navegador não os enviaria de `*.vercel.app` para `*.onrender.com`, que são sites diferentes. Ao trocar a URL da API, ajuste o `destination` dos rewrites em `vercel.json`.

`ReverseProxy__TlsTerminatedUpstream=true` é necessário sempre que a plataforma encerrar o TLS antes do container. Sem essa flag, `Request.IsHttps` é falso — os cabeçalhos encaminhados só são aceitos de proxies declarados — e `UseHttpsRedirection` entra em laço de redirecionamento. A flag não amplia a confiança em proxies; apenas declara que o TLS já foi tratado na borda.

Limitações conhecidas deste ambiente, aceitáveis para demonstração e não para produção:

- o IP gravado na evidência de aceite e nas partições de rate limit é o do proxy, não o do visitante, porque `ReverseProxy__KnownProxies` não inclui os endereços dinâmicos das plataformas. Os limites `auth` (10/min) e `public-menu` (120/min) passam a valer para todos os visitantes somados;
- sem `DataProtection__KeysPath` em volume persistente, cada reinício invalida sessões e tokens antiforgery. No plano gratuito do Render o serviço hiberna por inatividade, então a primeira visita depois de um período ocioso demora dezenas de segundos e derruba sessões anteriores;
- o login com Google permanece indisponível enquanto não houver credenciais; o botão aparece desabilitado;
- migrations não rodam no start. O schema precisa estar aplicado no Neon antes do deploy.
