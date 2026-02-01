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
- **Segurança:** Sistema preparado para integração com LDAP/AD (Login Simulado no momento).

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
