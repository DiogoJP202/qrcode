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

Em desenvolvimento, a API carrega o `.env` mais próximo da raiz do Git sem sobrescrever variáveis já definidas no processo. Credenciais padrão `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_REGION` ativam automaticamente o provider S3. Informe também `AWS_S3_BUCKET`; `AWS_S3_PUBLIC_URL` é opcional e, quando ausente, usa `{endpoint}/{bucket}`. O bucket de imagens públicas precisa permitir leitura pública no provedor.
