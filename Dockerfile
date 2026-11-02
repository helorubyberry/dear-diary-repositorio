FROM nginx:alpine

# Configuração para servir na porta 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos do site
COPY index.html style.css script.js /usr/share/nginx/html/
COPY imagens/ /usr/share/nginx/html/imagens/

EXPOSE 8080
