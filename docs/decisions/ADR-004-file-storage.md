# ADR-004 — Storage abstrato

**Status:** Aceito

## Decisão

Arquivos usam `IFileStorage`, com disco local em desenvolvimento e implementação S3-compatible em produção. PostgreSQL guarda apenas metadados.

## Consequências

O produto não depende do filesystem do servidor e pode usar R2, S3 ou MinIO sem mudar o domínio.
