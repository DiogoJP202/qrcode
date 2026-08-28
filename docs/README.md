# QRPortal — documentação técnica

O QRPortal é um SaaS para criação e publicação de cardápios digitais. Esta pasta é a fonte de verdade da arquitetura e deve ser atualizada junto com cada mudança relevante.

## Documentos

- [Arquitetura](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Banco de dados](DATABASE.md)
- [API](API.md)
- [Autenticação](AUTHENTICATION.md)
- [Frontend](FRONTEND.md)
- [Arquivos e imagens](FILE-STORAGE.md)
- [Segurança](SECURITY.md)
- [Deploy](DEPLOYMENT.md)
- [Decisões arquiteturais](decisions/)

## Auditoria do protótipo

O protótipo original é uma landing page React/Vite de 1.379 linhas concentrada em `src/App.tsx`. Ele demonstra a identidade verde, mensagem comercial, mockups de celular, editor visual, templates e a proposta de QR Code dinâmico.

Reutilizar conceitualmente:

- marca QRPortal, verde principal e contraste com superfícies claras/escuras;
- mensagem de criação rápida de cardápio;
- preview de celular e editor lado a lado;
- textos de cardápio, personalização e publicação;
- tipografia limpa e microinterações discretas.

Não reutilizar como arquitetura:

- componente monolítico e estilos inline;
- dados e métricas fictícios;
- QR Code meramente decorativo;
- links sem destino e interações sem persistência;
- responsividade quebrada por estilos inline;
- configuração genérica de SEO/Figma Make.

O protótipo será preservado em `legacy/prototype-react` até a nova interface atingir paridade aprovada.

## Gate de implementação

Esta documentação e os ADRs foram criados antes da Foundation. Alterações arquiteturais futuras exigem atualização do documento correspondente e, quando mudarem uma decisão, um novo ADR.
