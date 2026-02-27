# Stage 1: Build da aplicação React/Vite
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Accepts API URL at build time to burn into static react files
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Servidor Web Nginx para arquivos estáticos
FROM nginx:alpine

# Copia os arquivos bundlados do stage anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copia a configuração do nginx que roteia todas as requisições para o index.html (suporte a React Router/SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
