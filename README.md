# 🚀 SaaS Social Media Automator (Powered by Google Gemini)

Este projeto é uma plataforma SaaS (Software as a Service) desenvolvida para automatizar a presença de empresas no Instagram. O sistema utiliza a inteligência técnica do **Google Gemini** para criar conteúdos personalizados e a **Instagram Graph API** para postagem direta, sem intermediários.

---

## 🛠️ Funcionalidades Principais

* **Multi-Tenant Architecture**: Estrutura preparada para hospedar múltiplos clientes de ramos diferentes.
* **Custom Business Context**: Área de onboarding onde a IA aprende sobre o nicho, público-alvo e tom de voz da empresa.
* **BYO-Key (Bring Your Own Key)**: Cada cliente utiliza sua própria API Key do Google, garantindo escalabilidade e gestão de custos.
* **Geração de Conteúdo 360º**:
    * **Texto**: Legendas persuasivas via Gemini 1.5 Flash/Pro.
    * **Imagem**: Geração de artes visuais via Imagen 3 (Google Cloud).
* **Postagem Direta**: Integração nativa com a API da Meta para agendamento e postagem automática.
* **Dashboard Administrativo**: Interface moderna em Dark Mode para gestão de calendário e métricas.

---

## 🧰 Stack Técnica

* **Frontend**: React.js / Vite / Tailwind CSS
* **Backend**: Node.js / Express
* **Banco de Dados**: PostgreSQL (Supabase)
* **IA**: Google Generative AI (Gemini & Imagen)
* **Infraestrutura**: Docker / Hospedagem VPS (Hostinger)
* **Automação**: Instagram Graph API

---

## 🚀 Como Iniciar (Desenvolvimento)

1.  **Clone o repositório**:
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    ```

2.  **Instale as dependências**:
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente (`.env`)**:
    Crie um arquivo `.env` na raiz e adicione:
    ```env
    DATABASE_URL=seu_link_postgresql
    SUPABASE_KEY=sua_chave_supabase
    # As chaves de clientes são armazenadas no DB para o SaaS
    ```

4.  **Inicie o projeto**:
    ```bash
    npm run dev
    ```

---

## 🐳 Deploy via Docker (VPS Hostinger)

Este projeto já inclui configurações de Docker para facilitar o deploy em servidores VPS:

```bash
docker-compose up -d --build
