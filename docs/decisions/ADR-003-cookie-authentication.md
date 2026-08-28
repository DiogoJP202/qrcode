# ADR-003 — Autenticação por cookie

**Status:** Aceito

## Decisão

Usar ASP.NET Core Identity com cookie HttpOnly/Secure, antiforgery e CORS restritivo. Tokens sensíveis não serão armazenados no browser.

## Consequências

Reduz exposição a roubo por XSS, mas exige coordenação rigorosa de cookie, origem e CSRF entre Angular e API.
