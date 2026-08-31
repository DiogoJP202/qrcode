# API REST

Base: `/api/v1`. JSON em camelCase. Erros seguem RFC ProblemDetails com `type`, `title`, `status`, `detail`, `traceId`, `code` e, para validação, `errors` por campo.

## Rotas

```text
GET    /auth/csrf
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/confirm-email
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/google/start
GET    /auth/google/complete
GET    /me

GET|POST       /stores
GET|PATCH      /stores/{storeId}
PUT            /stores/{storeId}/logo
GET|POST       /stores/{storeId}/menus
GET|PATCH      /menus/{menuId}
POST           /menus/{menuId}/publish
POST           /menus/{menuId}/archive
POST           /menus/{menuId}/categories
PATCH|DELETE   /categories/{categoryId}
PUT            /menus/{menuId}/categories/order
POST           /menus/{menuId}/products
PATCH|DELETE   /products/{productId}
PUT            /menus/{menuId}/products/order
PUT            /products/{productId}/image
GET|PUT         /menus/{menuId}/theme

GET /public/menus/{slug}
GET /public/products/{productId}
GET /public/products/{productId}/qr.svg
GET /public/products/{productId}/qr.png
```

## Convenções

- UUIDs não conferem autorização; o backend valida membership em toda operação privada.
- Listas usam `page` e `pageSize` (máximo 100) e retornam `items`, `page`, `pageSize` e `total`.
- Criação retorna `201` e `Location`; deleção retorna `204`.
- Endpoints mutáveis exigem antiforgery header.
- Leitura pública retorna DTO mínimo e ETag, com revalidação obrigatória para que edições publicadas e mídias apareçam na próxima navegação.
- O detalhe público só retorna produtos disponíveis dentro de categoria ativa e cardápio publicado. O UUID v7 é a identificação permanente usada na URL individual, independente do slug atual do cardápio.
- QR Codes são gerados pelo backend apenas para produtos públicos válidos e apontam para `Frontend:PublicBaseUrl`; PNG e SVG aceitam `?download=true`.
- O documento OpenAPI gera os tipos em `src/frontend/qrportal-web/src/app/core/generated`; execute `pnpm contracts` com a API local ativa.
