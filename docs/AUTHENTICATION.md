# Autenticação e autorização

ASP.NET Core Identity usa `ApplicationUser` com UUID v7. O frontend nunca armazena tokens sensíveis.

## Sessão

- cookie de aplicação HttpOnly, Secure, SameSite=Lax e Path `/`;
- validade de oito horas com renovação deslizante;
- “lembrar-me” cria sessão persistente de até 30 dias;
- security stamp validado periodicamente para revogação;
- logout invalida a sessão e remove o cookie.

Em `Development` e `E2E`, executados por HTTP local, os cookies usam nomes sem o prefixo `__Host-` e `SameAsRequest`. Os demais ambientes mantêm `Secure=Always` e o prefixo `__Host-`.

## Antiforgery e CORS

`GET /api/v1/auth/csrf` emite o token antiforgery. O Angular o envia em `X-CSRF-TOKEN` em POST/PUT/PATCH/DELETE. Produção aceita somente a origem configurada e `AllowCredentials`; curingas são proibidos.

## Fluxos

- cadastro local: e-mail + senha, envio de confirmação e acesso ao editor;
- publicação requer e-mail confirmado;
- Google OAuth retorna à API e redireciona para o onboarding;
- recuperação usa token de uso limitado enviado por e-mail;
- lockout: cinco falhas por 15 minutos;
- autorização por política e membership de loja, nunca por ID isolado.

## E-mail

`ITransactionalEmailSender` grava mensagens HTML em `src/backend/QrPortal.Api/data/emails` no desenvolvimento iniciado pelo comando padrão, permitindo abrir os links de confirmação e recuperação sem Docker. Defina `Email__Provider=Smtp` para usar Mailpit ou outro servidor SMTP; produção usa SMTP. O diretório local é ignorado pelo Git e templates não registram tokens, senhas ou PII desnecessária em logs.
