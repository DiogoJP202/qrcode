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

Documentar e fornecer exemplos para connection string, frontend origin, domínio público, Google OAuth, SMTP, S3 endpoint/bucket/credentials e `DataProtection__KeysPath`. O diretório de chaves deve estar em volume persistente, gravável pelo usuário `app` do container. Nenhum secret é commitado.

O `.env` raiz é carregado automaticamente apenas em `Development`. Para Neon Object Storage, são aceitas as variáveis AWS geradas pelo serviço e as adicionais `AWS_S3_BUCKET` e `AWS_S3_PUBLIC_URL`. Produção deve fornecer os mesmos valores pelo gerenciador de secrets da plataforma, não por arquivo versionado.

O repositório inclui `src/backend/QrPortal.Api/Dockerfile` e `src/frontend/qrportal-web/Dockerfile`. A API roda como usuário não-root na porta 8080; o container web usa Nginx com fallback do Angular e headers de segurança. Antes do deploy:

```text
dotnet tool restore
dotnet tool run dotnet-ef migrations has-pending-model-changes --project src/backend/QrPortal.Infrastructure --startup-project src/backend/QrPortal.Api
dotnet tool run dotnet-ef database update --project src/backend/QrPortal.Infrastructure --startup-project src/backend/QrPortal.Api
```

O readiness check `/health/ready` consulta PostgreSQL; `/health/live` verifica apenas o processo. O proxy reverso deve encaminhar `X-Forwarded-For` e `X-Forwarded-Proto` a partir de um proxy confiável.

## Rollback

Deploy da API mantém a versão anterior disponível. Migrations destrutivas exigem expansão/contração em releases separadas. Frontend é revertido por artefato imutável.
