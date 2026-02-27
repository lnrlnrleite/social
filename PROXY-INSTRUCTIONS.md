# Guia de Configuração - Proxy Reverso (NGINX Hostinger)

Como a aplicação está rodando em portas locais (`127.0.0.1:3100` para Frontend e `127.0.0.1:3101` para a API) para não dar conflito com seus bancos e sites que já rodam aí, você precisará configurar o Nginx da sua VPS para captar o seu domínio e "jogar" para o Docker.

Você deve criar um **Server Block (Virtual Host)** na sua VPS (normalmente em `/etc/nginx/sites-available/social.datapowerlabs.com.br` ou pela interface gráfica se usar aaPanel/Plesk).

## Exemplo de Server Block:

```nginx
server {
    listen 80;
    server_name social.datapowerlabs.com.br;

    # 1. Roteamento da API Backend
    # Todas chamadas que começam com /api vão direto para o container Node.js na porta 3101
    location /api/ {
        proxy_pass http://127.0.0.1:3101/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Roteamento do Frontend React
    # O restante (Raiz) vai para o container do Vite+Nginx na porta 3100
    location / {
        proxy_pass http://127.0.0.1:3100/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Após configurar:
Se você estiver configurando via terminal puro do Ubuntu/Debian:
1. Habilite o site criando um symlink: `sudo ln -s /etc/nginx/sites-available/social.datapowerlabs.com.br /etc/nginx/sites-enabled/`
2. Teste o Nginx: `sudo nginx -t`
3. Reinicie o Nginx: `sudo systemctl restart nginx`
4. Gere o certificado SSL grátis para o subdomínio rodando o Certbot: `sudo certbot --nginx -d social.datapowerlabs.com.br`
