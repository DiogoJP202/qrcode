# ADR-002 — PostgreSQL e EF Core

**Status:** Aceito

## Decisão

PostgreSQL com EF Core/Npgsql será a fonte transacional, usando UUID v7, constraints, migrations e UTC.

## Consequências

O modelo mantém integridade no banco e a aplicação conserva portabilidade razoável sem abrir mão de recursos PostgreSQL úteis.
