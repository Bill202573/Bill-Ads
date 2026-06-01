# Arquitetura - Ads Manager

## 📋 Overview
App para gerenciar campanhas de Meta Ads e Google Ads com análise de performance e automação de criação de campanhas.

## 🏗️ Stack Técnico
- **Frontend**: React 18 + TypeScript + Tailwind + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **APIs Externas**: Meta Graph API + Google Ads API
- **IA**: Claude API (análise de resultados + otimizações)
- **Geração de Criativos**: Higgsfield API (futuramente)

## 📁 Estrutura de Pastas

```
src/
├── components/
│   ├── ui/
│   │   └── card.tsx
│   └── Layout.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Campaigns.tsx
│   └── Settings.tsx
├── services/
│   ├── meta-ads-service.ts
│   ├── google-ads-service.ts
│   ├── claude-insights-service.ts
│   └── supabase-service.ts
├── hooks/
│   └── useCampaignData.ts
├── types/
│   └── ads.ts
├── lib/
│   └── utils.ts
├── App.tsx
└── main.tsx
```

## 🗄️ Schema do Supabase

### Tabelas Principais:
1. **integrations** - Armazena credenciais OAuth das plataformas
2. **campaigns** - Dados das campanhas
3. **campaign_metrics** - Histórico de métricas por campanhas
4. **campaign_insights** - Análises geradas pela IA
5. **audit_log** - Log de ações
6. **sync_jobs** - Histórico de sincronizações

## 🔐 Fluxo de Autenticação

```
1. Usuário faz login no app (Supabase Auth)
2. Usuário conecta Meta/Google (OAuth 2.0)
3. Access tokens armazenados criptografados no Supabase
4. App usa tokens para fetch de dados periódicos
```

## 📊 Fluxo de Dados - Etapa 1

```
Meta/Google APIs
      ↓
Sync Service (cron job)
      ↓
Supabase (metrics table)
      ↓
Claude API (análise)
      ↓
Dashboard (visualização)
```

## 🎯 Próximos Passos
1. ✅ Criar schema do Supabase
2. ✅ Configurar autenticação (Supabase + OAuth)
3. ✅ Criar services para APIs (Meta/Google)
4. ✅ Componentes de dashboard
5. Integração com Claude API
6. Automação de campanhas (etapa 2)
