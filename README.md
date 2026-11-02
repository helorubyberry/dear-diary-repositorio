# Dear Diary

## Docker
```bash
# construir a imagem
docker build -t dear-diary .

# executar o container
docker run -d --name dear-diary -p 8080:8080 dear-diary

# acessar
# http://localhost:8080

# parar e remover
docker stop dear-diary && docker rm dear-diary
```

Novas postagens: copie um bloco `<article class="pagina">` em `index.html`.
Troque as fotos na pasta `imagens/` mantendo os nomes, ou altere o `src` no HTML.
