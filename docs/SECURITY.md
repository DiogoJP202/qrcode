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

## Ameaças prioritárias

- IDOR/Broken Access Control: consultar recurso já limitado ao usuário/loja;
- CSRF: token duplo em toda mutação autenticada;
- XSS: Angular escaping, sem HTML/CSS arbitrário;
- upload malicioso: limites, assinatura, decoder e nomes internos;
- brute force: lockout e rate limit;
- enumeração de conta: resposta neutra na recuperação; cadastro informa conflito de e-mail para orientar o usuário legítimo e permanece protegido por rate limit;
- path traversal: storage recebe somente chaves geradas internamente.

## Auditoria

Registrar login relevante, lockout, publicação, alteração de papel, falha de autorização e operações críticas com correlation ID. IP deve ser minimizado/anonimizado conforme política de privacidade.
