# ADR-001 — Monólito modular

**Status:** Aceito

## Decisão

Usar uma única API implantável, dividida em Domain, Application, Infrastructure e Api, com módulos explícitos por negócio.

## Consequências

Operação e transações permanecem simples. Limites de módulo evitam acoplamento e permitem extração futura sem custo atual de microservices.
