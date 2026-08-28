# ADR-008 — Deploy sem acoplamento a provedor

**Status:** Aceito

## Decisão

Frontend estático, API containerizada, PostgreSQL e S3-compatible serão configurados por ambiente, sem SDK de plataforma no domínio.

## Consequências

O sistema pode operar em VPS ou provedores gerenciados; a equipe assume configuração explícita de DNS, TLS, secrets e observabilidade.
