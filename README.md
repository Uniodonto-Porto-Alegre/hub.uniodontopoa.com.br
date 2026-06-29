# Hub Uniodonto Porto Alegre (hub.uniodontopoa.com.br)

Este é o portal central de sistemas da Uniodonto Porto Alegre, desenvolvido para modernizar e agilizar os processos operacionais e de auditoria.

## 🛠 Tecnologias
- **Framework:** Vue.js 3 (Composition API)
- **Linguagem:** TypeScript
- **Runtime/Gerenciador:** Bun
- **Build Tool:** Vite
- **Estilização:** Bootstrap 5 + SASS (SCSS)
- **Módulos:** Pinia (Estado), Vue Router (Rotas)

## 🚀 Funcionalidades Atuais
- **Núcleo Operacional (Analisador de Guias):**
  - Processamento 100% no navegador (Privacidade Garantida).
  - Identificação automática de códigos TISS via Regex.
  - Validação offline contra a tabela TISS (JSON).
  - Interface moderna com suporte a Drag & Drop.
  - Exportação de resultados para CSV.
- **Segurança:** Login integrado a backend de autenticação LDAP/AD via endpoint configurável no frontend.

## 🔐 Integração de Autenticação
- Em desenvolvimento, configure `VITE_BACKEND_URL` para o host do backend. O Vite fará proxy de `/api` para esse destino.
- Configure `VITE_AUTH_API_URL` com o caminho do endpoint de login. O padrão recomendado em dev é `/api/auth/login`.
- Se `VITE_AUTH_API_URL` não for definida, o frontend tentará autenticar em `/api/auth/login`.
- O frontend envia `POST` com JSON no formato `{ "username": "usuario.ad", "password": "senha" }`.
- O backend deve retornar um token e os dados do usuário autenticado. O frontend aceita respostas como:

```json
{
  "token": "jwt-ou-token",
  "user": {
    "username": "usuario.ad",
    "displayName": "Nome Sobrenome",
    "email": "usuario@dominio.com"
  }
}
```

- Também são aceitas chaves equivalentes comuns, como `access_token`, `display_name`, `name`, `cn`, `mail` e `samAccountName`.

## 🖥 Backend Node para AD
- O repositório agora inclui uma API Node em `server/` para autenticação com Active Directory via LDAP.
- O endpoint principal é `POST /api/auth/login`.
- O backend busca `displayName`, `mail`, `cn`, `sAMAccountName` e `memberOf` no AD.
- A resposta já é compatível com o frontend atual:

```json
{
  "token": "jwt-ou-session-id",
  "user": {
    "username": "usuario.ad",
    "displayName": "Nome Sobrenome",
    "email": "usuario@dominio.com",
    "groups": ["Grupo A", "Grupo B"]
  },
  "authMode": "jwt"
}
```

- O modo de autenticação do backend é controlado por `AUTH_MODE` e aceita `jwt` ou `session`.
- Para subir a API:
  1. Copie `server/.env.example` para `server/.env` e preencha os dados do AD.
  2. Rode `npm install --prefix server`.
  3. Rode `npm run dev:api`.
- Para rodar o frontend apontando para a API local, use `npm run dev`.

## 📁 Estrutura do Projeto
O projeto segue uma arquitetura modular por funcionalidades:
- `src/modules/Auth`: Gerenciamento de acesso e login.
- `src/modules/Dashboard`: Painel central de escolha de módulos.
- `src/modules/NucleoOperacional`: Lógica de auditoria e análise de guias médicas.
- `src/assets`: Identidade visual oficial (Logo, Cores, Fontes Georama).

## 💻 Como Rodar
1. Instale as dependências: `bun install`
2. Inicie o servidor de desenvolvimento: `bun run dev`

---
Desenvolvido por Uniodonto Porto Alegre.
