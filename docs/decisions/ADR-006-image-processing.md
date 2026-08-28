# ADR-006 — Processamento de imagens

**Status:** Aceito

## Decisão

Usar SkiaSharp com limites antes e após decode, saída WebP, metadados descartados e nomes UUID internos.

## Consequências

Há dependência nativa no container, coberta por smoke tests, em troca de licença permissiva e processamento cross-platform.
