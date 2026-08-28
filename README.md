# QRPortal

SaaS para criação e publicação de cardápios digitais.

## Estrutura

- `src/backend`: API ASP.NET Core .NET 10 em monólito modular;
- `src/frontend/qrportal-web`: aplicação Angular 22;
- `tests`: testes unitários e de integração;
- `docs`: arquitetura, operação e ADRs;
- `legacy/prototype-react`: protótipo visual original preservado.

## Desenvolvimento

Pré-requisitos: .NET 10, Node 24, pnpm 11 e Docker Desktop.

```bash
docker compose up -d postgres mailpit
dotnet restore QrPortal.sln
pnpm install
dotnet tool restore
dotnet tool run dotnet-ef database update --project src/backend/QrPortal.Infrastructure --startup-project src/backend/QrPortal.Api
dotnet run --project src/backend/QrPortal.Api --launch-profile http
pnpm web:start
```

API: `http://localhost:5043` · Swagger: `/swagger` · Web: `http://localhost:4200` · Mailpit: `http://localhost:8025`.

Use `pnpm build` e `pnpm test` para o gate local. `pnpm web:e2e` executa o fluxo completo com Playwright e exige PostgreSQL disponível. Com a API local ativa, `pnpm contracts` regenera os tipos TypeScript a partir do OpenAPI.

Consulte [docs/README.md](docs/README.md) antes de alterar decisões estruturais.
