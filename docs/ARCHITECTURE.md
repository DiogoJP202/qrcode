# Arquitetura

## Visão geral

O QRPortal adota um monólito modular: uma API ASP.NET Core concentra regras e persistência, enquanto um frontend Angular é distribuído como aplicação estática. PostgreSQL armazena dados relacionais e um storage S3-compatible armazena arquivos.

```text
Browser Angular
  ├── páginas públicas / landing /m/{slug}
  └── área autenticada
          │ HTTPS + cookie + antiforgery
          ▼
ASP.NET Core API /api/v1
  ├── Identity
  ├── Stores
  ├── Menus/Catalog
  ├── Media
  ├── Publishing
  ├── Plans
  └── Audit
       ├── PostgreSQL
       ├── S3-compatible storage
       └── SMTP
```

## Tecnologias

- .NET 10 LTS, ASP.NET Core, C# e nullable reference types;
- Entity Framework Core, Npgsql e PostgreSQL;
- ASP.NET Core Identity e cookies seguros;
- Angular 22, TypeScript strict, Tailwind CSS 4, Angular CDK e Lucide;
- SkiaSharp para tratamento de imagens;
- xUnit, Testcontainers, Vitest e Playwright;
- OpenAPI, ProblemDetails, health checks e logging JSON por `ILogger`.

## Estrutura

```text
docs/
legacy/prototype-react/
src/
  backend/
    QrPortal.Api/
    QrPortal.Application/
    QrPortal.Domain/
    QrPortal.Infrastructure/
  frontend/qrportal-web/
tests/
  QrPortal.UnitTests/
  QrPortal.IntegrationTests/
```

O domínio contém entidades e invariantes. Application expõe casos de uso e contratos sem depender da infraestrutura. Infrastructure implementa EF Core, Identity, storage, imagem e e-mail. Api contém endpoints, autenticação, middleware e composição de dependências.

## Módulos

- **Identity:** conta, sessão, confirmação, Google e recuperação.
- **Stores:** loja, branding e membros.
- **Menus/Catalog:** cardápios, categorias, produtos e ordenação.
- **Media:** metadados, processamento e storage.
- **Publishing:** validação de publicação e leitura pública.
- **Plans:** assinatura e limites centralizados.
- **Audit:** eventos de segurança e mudanças críticas.

## Fluxos principais

1. Usuário se registra ou usa Google e recebe cookie de sessão.
2. Onboarding cria loja, cardápio, categoria e produto de forma incremental.
3. Imagens passam pela API, são decodificadas, normalizadas e enviadas ao storage.
4. Aparência é salva como dados validados, nunca como CSS arbitrário.
5. Publicação exige e-mail confirmado, loja/cardápio válidos e produto disponível.
6. `/m/{slug}` consome um DTO público cacheável; edições salvas em cardápio publicado aparecem imediatamente.

## Deploy

Frontend estático em CDN; API em container; PostgreSQL e storage S3-compatible externos. O desenho não depende de um provedor. Produção usa `qrportal.com` e `api.qrportal.com`; desenvolvimento usa portas locais com CORS explícito.

## Riscos e mitigação

- Cookies cross-origin: origens exatas, credenciais e antiforgery obrigatório.
- Upload hostil: limites antes/depois da decodificação e processamento isolado.
- IDOR: toda consulta privada parte do usuário e de `StoreMember`.
- Crescimento do monólito: módulos e dependências direcionais verificáveis.
- Drift API/frontend: tipos TypeScript gerados do OpenAPI.
- Docker ausente localmente: pré-requisito documentado, sem impedir builds unitários.
