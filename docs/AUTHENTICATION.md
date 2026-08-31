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

- cadastro local: nome completo, telefone, e-mail, senha e aceite obrigatório da versão vigente dos Termos de Uso/Política de Privacidade;
- a evidência de aceite guarda usuário, versão, instante UTC, IP observado pela API e, somente se o usuário optar e autorizar o navegador, coordenadas reduzidas para duas casas decimais;
- publicação requer e-mail confirmado;
- Google OAuth retorna à API; contas já existentes entram diretamente, enquanto novos usuários concluem nome, telefone e aceite em `/cadastro-google` antes da criação da conta;
- recuperação usa token de uso limitado enviado por e-mail;
- lockout: cinco falhas por 15 minutos;
- autorização por política e membership de loja, nunca por ID isolado.

## Google OAuth

Configure `Authentication__Google__ClientId` e `Authentication__Google__ClientSecret` no ambiente da API. No Google Cloud Console, a URI de redirecionamento autorizada deve ser exatamente:

```text
http://localhost:5043/signin-google
https://api.qrportal.com/signin-google
```

O primeiro endereço é apenas para desenvolvimento; produção exige HTTPS, tela de consentimento configurada e domínio autorizado. A sessão externa fica em cookie HttpOnly por até dez minutos e é removida ao concluir ou falhar definitivamente o fluxo. Segredos e dados pessoais nunca são incluídos na URL de retorno do frontend.

## E-mail

`ITransactionalEmailSender` grava mensagens HTML em `src/backend/QrPortal.Api/data/emails` no desenvolvimento iniciado pelo comando padrão, permitindo abrir os links de confirmação e recuperação sem Docker. Defina `Email__Provider=Smtp` para usar Mailpit ou outro servidor SMTP; produção usa SMTP. O diretório local é ignorado pelo Git e templates não registram tokens, senhas ou PII desnecessária em logs.
