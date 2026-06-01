# Ads Manager

Aplicação web para gerenciar e analisar campanhas de Meta Ads e Google Ads com insights automáticos gerados por IA.

## 🎯 Funcionalidades

### Etapa 1: Análise de Campanhas ✅
- ✅ Conectar contas de Meta Ads e Google Ads (OAuth)
- ✅ Sincronizar campanhas e métricas automaticamente
- ✅ Dashboard com visão geral de performance
- ✅ Análise de métricas com IA (Claude)
- ✅ Recomendações automáticas de otimização
- ✅ Alertas sobre problemas

### Etapa 2: Criação Automática de Campanhas (Planejado)
- 🔄 Geração de campanhas automáticas
- 🔄 Criação de criativos com IA (Higgsfield)
- 🔄 Demanda para designers (integração com n8n)

## 🏗️ Stack Técnico

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **APIs**: Meta Graph API + Google Ads API
- **IA**: Claude API (análise e insights)
- **State Management**: React Query + TanStack Query
- **Build**: Vite

## 🚀 Quick Start

### 1. Instalação

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-anon-key
REACT_APP_CLAUDE_API_KEY=sk-ant-xxx
REACT_APP_META_APP_ID=seu-app-id
REACT_APP_GOOGLE_ADS_DEVELOPER_TOKEN=seu-token
```

Veja `.env.example` para todas as variáveis necessárias.

### 3. Rodas Desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:5173

### 4. Build para Produção

```bash
npm run build
```

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes React
├── pages/            # Páginas (Dashboard, Campaigns, Settings)
├── services/         # Lógica de integração com APIs
├── hooks/            # React Hooks customizados
├── types/            # TypeScript interfaces
└── lib/              # Utilidades
```

## 🔧 Setup das APIs

Veja [SETUP_GUIDE.md](./SETUP_GUIDE.md) para instruções detalhadas sobre:
- Criar app Meta Ads
- Configurar Google Ads API
- Setup Supabase
- Configurar Claude API

## 📊 Arquitetura

![Fluxo de Dados](./ARCHITECTURE.md)

## 🔐 Segurança

- ✅ Tokens OAuth armazenados criptografados
- ✅ Row Level Security (RLS) no Supabase
- ✅ Sem exposição de credenciais no frontend

## 📝 Documentação

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Visão geral da arquitetura
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Como configurar as APIs
- [TECH_ANALYSIS.md](./TECH_ANALYSIS.md) - Análise técnica detalhada

## 🛠️ Troubleshooting

### Erro ao conectar Supabase
- Verifique se a URL e chave estão corretas
- Certifique-se que o projeto Supabase está criado

### Erro na autenticação Meta/Google
- Verifique se os redirect URIs estão configurados corretamente
- Confirm que o app ID/secret estão corretos

### Nenhuma campanha aparecendo
- Certifique-se que as contas estão conectadas em Settings
- Aguarde até 5 minutos para a primeira sincronização

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido com Claude Code
