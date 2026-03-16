# ADR 003: Cloudflare Workers sobre AWS/GCP

## Status

Aceito

## Contexto

O sistema precisa de:
- Deploy global na edge (baixa latência)
- Escalabilidade automática
- Custo previsível
- Infraestrutura simplificada (sem Kubernetes)

## Decisão

Usar **Cloudflare Workers** com **D1** (SQLite) e **KV**.

## Alternativas Consideradas

### 1. AWS (ECS + RDS)

**Prós:**
- Ecossistema maduro
- Serviços amplos

**Contras:**
- Complexidade de configuração
- Necessidade de Terraform/Kubernetes
- Custo mais alto para pequeno/médio porte

### 2. Google Cloud Run + Cloud SQL

**Prós:**
- Serverless containers
- PostgreSQL gerenciado

**Contras:**
- Cold starts significativos
- Configuração complexa
- Menos edge locations

### 3. Vercel + Postgres

**Prós:**
- DX excelente
- Integração com Next.js

**Contras:**
- Limitações de runtime (10s/Function)
- Lock-in na Vercel

### 4. Cloudflare Workers (Escolhido)

**Prós:**
- Cold start zero (V8 isolates)
- 300+ edge locations
- D1 (SQLite serverless) com replicação
- KV para cache
- Custo previsível (pay-per-request)
- Sem necessidade de Kubernetes

**Contras:**
- Runtime limitado (50ms CPU por request)
- D1 ainda em beta (mas estável)
- SQLite menos poderoso que PostgreSQL

## Consequências

### Positivas
- Deploy global automático
- Sem servidor para gerenciar
- Escalabilidade automática
- Custo inicial zero (free tier generoso)

### Negativas
- Limitações de runtime Workers
- D1 não tem todas as features do PostgreSQL
- Menos ferramentas de debugging que AWS

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare                             │
│                                                         │
│  ┌──────────────┐    ┌──────────┐    ┌──────────┐      │
│  │   Workers    │    │    D1    │    │    KV    │      │
│  │  (React      │<--->│ (SQLite  │    │  (Cache  │      │
│  │   Router)    │    │  Durável)│    │   e KV)  │      │
│  └──────────────┘    └──────────┘    └──────────┘      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         WAF + Rate Limiting (Edge)               │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Referências

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [ROADMAP.md - Fase 4](./ROADMAP.md)
