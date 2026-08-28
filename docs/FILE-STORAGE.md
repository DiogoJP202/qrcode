# Arquivos e imagens

## Abstrações

- `IFileStorage`: gravar, remover e obter URL pública por chave interna.
- `IImageProcessor`: validar, decodificar e gerar variantes.
- implementações: disco local em desenvolvimento e S3-compatible em produção.

O banco armazena metadados e chaves; nunca binários.

## Política de upload

- máximo de 10 MB, 6.000×6.000 e 36 megapixels;
- formatos aceitos: JPEG, PNG e WebP estático;
- validar MIME informado, assinatura e decodificação real;
- rejeitar animações, arquivos truncados, dimensões inválidas e decompression bombs;
- descartar metadados e nomes fornecidos pelo usuário;
- gerar chaves UUID sem segmentos controlados pelo cliente.

## Variantes

- produto: WebP principal de até 1.200 px, qualidade 82; thumbnail de 400 px, qualidade 76;
- logo: até 512 px, preservando transparência;
- checksum SHA-256 para integridade e futura deduplicação.

Uploads são endpoints vinculados a produto/loja já autorizados, reduzindo órfãos. Falhas removem objetos parciais.
