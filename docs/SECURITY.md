# Segurança

## Controles obrigatórios

- HTTPS, cookie seguro, antiforgery e CORS com origens exatas;
- autorização por membership em todas as queries privadas;
- EF Core parametrizado, DTOs explícitos e proteção contra mass assignment;
- validação server-side de strings, preço, slug, cor, URL e arquivos;
- rate limiting para autenticação, recuperação, uploads e endpoints públicos;
- headers de segurança e CSP compatível com o frontend;
- secrets somente por environment variables/user secrets;
- logs sem senha, token, secret ou conteúdo desnecessário.

## Logging HTTP e erros

- cada resposta registra método, template da rota (sem IDs ou query string), status, duração, ator autenticado ou `anonymous` e correlation ID;
- corpos, query strings, cookies, cabeçalhos, e-mails, credenciais e tokens não são registrados;
- `X-Correlation-ID` recebido aceita somente 1–64 caracteres alfanuméricos, ponto, hífen ou underscore; valores inválidos são substituídos por UUID v7;
- erros HTTP usam `application/problem+json` com `code` e `traceId`; 404 de recurso inexistente e de ownership negado têm a mesma mensagem pública;
- exceções inesperadas são registradas no servidor, mas a resposta pública nunca inclui stack trace ou mensagem interna;
- probes `/health/*` usam nível `Debug` para não poluir o fluxo operacional.

## Ameaças prioritárias

- IDOR/Broken Access Control: consultar recurso já limitado ao usuário/loja;
- CSRF: token duplo em toda mutação autenticada;
- XSS: Angular escaping, sem HTML/CSS arbitrário;
- upload malicioso: limites, assinatura, decoder e nomes internos;
- brute force: lockout e rate limit;
- enumeração de conta: resposta neutra na recuperação; cadastro informa conflito de e-mail para orientar o usuário legítimo e permanece protegido por rate limit;
- path traversal: storage recebe somente chaves geradas internamente.

## Auditoria

`AuditLogs` registra somente ator, nome do evento, tipo/ID do recurso, horário UTC e correlation ID. O MVP cobre cadastro, login e falha, lockout, logout, confirmação de e-mail, recuperação de senha, OAuth, falha de autorização, publicação/arquivamento, alterações do catálogo, tema, logo e imagem de produto. Senhas, tokens, e-mails, IPs e conteúdo das mudanças não entram no registro.

O rate limiter registra rejeições sem IP ou parâmetros. IP é usado apenas em memória como chave de limitação para tráfego anônimo e deve permanecer confiável somente quando vier de um proxy explicitamente permitido.

## Evidência de aceite e privacidade

`TermsAcceptances` é separado de `AuditLogs` e registra uma evidência versionada de cadastro. O IP é obtido exclusivamente de `RemoteIpAddress` após `UseForwardedHeaders`; cabeçalhos vindos de proxies não cadastrados não são confiados. A localização é opt-in, não bloqueia o cadastro e é arredondada para duas casas decimais antes da persistência. Nunca solicitar localização silenciosamente.

Antes do lançamento público, a Política de Privacidade e os Termos precisam de revisão jurídica e da identificação formal do controlador (razão social, CNPJ/endereço e canal do encarregado, conforme aplicável), além de prazos operacionais de retenção, exclusão e atendimento aos titulares.
