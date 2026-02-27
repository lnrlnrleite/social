# ✨ Automkt SaaS (Multi-tenant)

Um sistema base completo para Software as a Service (SaaS) construído com arquitetura Multi-tenant, integrando Inteligência Artificial (Google Gemini & Imagen) e publicação direta no Instagram (Meta Graph API). O projeto está totalmente containerizado com Docker, pronto para ir para produção.

## 🚀 Funcionalidades Inclusas

*   **Arquitetura Multi-Tenant**: Cada cliente tem seu próprio ID e configurações isoladas no Banco de Dados.
*   **Criptografia Nativa AES-256**: As chaves de API sensíveis (como do Google Gemini) são criptografadas e descriptografadas de forma transparente e segura pelo Node.js e salvas no PostgreSQL.
*   **Gerador de Posts Inteligente**: Um serviço consome perfis da empresa (Tom de Voz, Nicho) e pede ao `gemini-1.5-flash` que redija legendas otimizadas e hashtags. Em seguida, um prompt otimizado é repassado ao `imagen-3.0` que cria e retorna fotos institucionais 100% originais.
*   **Auto-Publicação no Instagram**: Integração com a Facebook Graph API v19. O backend cria os Media Containers da Meta e posta o resultado (Imagem + Legenda) diretamente no feed do cliente (precisa de tokens válidos).
*   **Interface Premium**: Frontend em React (Vite) aplicando conceitos de UX/UI modernos como Glassmorphism, Clean Design e Dark Mode, planejado para empreendedores não tecnológicos.

## 🛠 Tecnologias Utilizadas

**Backend**
*   Node.js (Express)
*   PostgreSQL + `pg` driver
*   Google Generative AI SDK (`@google/generative-ai`)
*   Axios

**Frontend**
*   React 18 + Vite
*   Vanilla CSS Responsivo e Interativo

**Infraestrutura**
*   Docker & Docker Compose
*   Nginx (como Proxy Reverso/Servidor Estático do FrontendSPA)

---

## 💻 Como Rodar o Projeto

Você tem duas formas de iniciar o projeto (Com Docker ou Servidores Locais avulsos).
A forma mais rápida e recomendada é garantir que você tenha o **Docker e o Docker Compose** instalados na sua máquina/servidor.

### 1. Preparando o Ambiente 

Renomeie o arquivo de variáveis de ambiente e edite os valores de acordo com as suas preferências:

```bash
cp .env.example .env
```
> [!WARNING]  
> A variável `ENCRYPTION_KEY` dentro do `.env` DEVE OBRIGATORIAMENTE conter exatamente 32 caracteres para que a criptografia AES-256 no banco de dados funcione.

### 2. Rodando via Docker (Automático/Produção)

Basta estar na raiz do projeto e digitar no terminal:
```bash
docker-compose up -d --build
```

O Compose irá:
1. Começar o banco `postgres` e rodar o script `schema.sql` construindo as tabelas iniciais na porta `5432`.
2. Instalar e rodar o Backend Node (`saas_api_node`) expondo a porta `3001`.
3. Compilar o Frontend do Vite com Nginx (`saas_web_react`) expondo a porta web padrão `80`.

Basta abrir seu navegador no `http://localhost` (Frontend).

### 3. Rodando Manualmente (Modo Desenvolvimento)

Se preferir não usar Docker no backend/frontend para desenvolver, siga os passos abaixo *após iniciar sua própria instância do PostgreSQL*.

**Para o Backend:**
```bash
cd backend
npm install
npm start
```

**Para o Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🗝 Integrações de Terceiros e Acessos

*   **Google Gemini (AI)**: O tenant precisa de uma `API Key` do Google AI Studio com verbas ou Tier Livre para ter acesso as criações dos fluxos `/generate`.
*   **Meta Graph API (Instagram)**: O Token do cliente armazenado no Dashboard requer scopes de Postagens (`instagram_basic`, `instagram_content_publish`, etc.) sendo validado por um Facebook Business ID de conta profissional configurado para usar a rota `/publish`. O Instagram não aceita envio de base64 nos seus endpoints oficiais, sendo necessário hospedar o arquivo (AWS S3, Imgur) para validar a url pela Meta Graph API.
