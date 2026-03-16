# Arquitetura do Human-AI Cognitive Interface

## Visão Geral

O Human-AI Cognitive Interface é um sistema de mediação cognitiva que transforma intenção humana difusa em contratos explícitos e especificações operacionais. A arquitetura é projetada para ser escalável, determinística e auditável.

## Diagrama de Contexto (C4 - Level 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Usuário                                   │
│  (Desenvolvedor, Analista, Gestor, etc.)                        │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ 1. Define intenção
                   │ 2. Configura contrato
                   │ 3. Responde coleta
                   v
┌─────────────────────────────────────────────────────────────────┐
│           Human-AI Cognitive Interface                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Etapa 0    │  │   Etapa 1    │  │      Etapa 2         │   │
│  │   Papel     │->│   Réguas +   │->│  Protocolo de        │   │
│  │  Inicial    │  │    Match     │  │      Coleta          │   │
│  └─────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                   │
                   │ 4. Recebe especificação canônica
                   v
┌─────────────────────────────────────────────────────────────────┐
│                      Modelo de IA                                │
│              (Claude, GPT, etc.)                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Diagrama de Container (C4 - Level 2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Sistema                                            │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   apps/web      │    │  packages/core  │    │  packages/types │         │
│  │                 │    │                 │    │                 │         │
│  │ React Router v7 │<--->│ Motor Canônico  │<--->│  Tipos TS       │         │
│  │ Cloudflare      │    │ (Match/Deriv)   │    │                 │         │
│  │ Workers         │    │                 │    │                 │         │
│  └────────┬────────┘    └─────────────────┘    └─────────────────┘         │
│           │                                                                  │
│           │ usa                                                              │
│           v                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │ packages/config │    │   Cloudflare    │    │  apps/raycast   │         │
│  │                 │    │                 │    │                 │         │
│  │ JSONs Canônicos │    │  D1 (SQLite)    │    │ Extensão        │         │
│  │                 │    │  KV (Cache)     │    │ Raycast         │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Diagrama de Componentes (C4 - Level 3)

### apps/web

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Router v7 App                         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Routes    │    │   Actions   │    │   Loaders   │         │
│  │             │    │             │    │             │         │
│  │ _index.tsx  │    │ session.new │    │ session.$id │         │
│  │ stage-0.tsx │    │ stage-1     │    │ stage-0     │         │
│  │ stage-1.tsx │    │ stage-2     │    │ stage-1     │         │
│  │ stage-2.tsx │    │             │    │ stage-2     │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                   │                │
│         └──────────────────┴───────────────────┘                │
│                            │                                    │
│                            v                                    │
│                    ┌───────────────┐                           │
│                    │    D1/KV      │                           │
│                    │  (Cloudflare) │                           │
│                    └───────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

### packages/core

```
┌─────────────────────────────────────────────────────────────────┐
│                     Core Engine                                 │
│                                                                 │
│  ┌────────────────┐    ┌────────────────┐                      │
│  │   Match Engine │    │ Derivation     │                      │
│  │                │    │ Engine         │                      │
│  │ - distance.ts  │    │                │                      │
│  │ - weights.ts   │    │ - rules.ts     │                      │
│  │ - score.ts     │    │ - implicit.ts  │                      │
│  │ - hard-blocks  │    │ - blocks.ts    │                      │
│  │ - corrections  │    │ - ordering.ts  │                      │
│  └────────────────┘    └────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

1. **Etapa 0 - Papel Inicial**:
   ```
   Usuário -> Seleciona papel -> Action cria sessão -> D1 salva
   ```

2. **Etapa 1 - Réguas + Match**:
   ```
   Usuário -> Ajusta réguas -> Loader calcula match -> Mostra níveis
          -> Confirma -> Action salva contrato -> D1 atualiza
   ```

3. **Etapa 2 - Coleta**:
   ```
   Usuário -> Loader deriva critérios -> Mostra blocos
          -> Responde -> Action valida e salva -> D1 atualiza
          -> Completa -> Gera payload
   ```

## Decisões Técnicas

1. **Monorepo com Turborepo**: Permite compartilhar código entre apps e packages com caching eficiente.

2. **React Router v7 Framework**: Oferece SSR, data loading e actions integrados, ideal para a arquitetura de "API embutida".

3. **Cloudflare Workers**: Deploy serverless na edge com cold start zero, ideal para UX responsiva.

4. **D1 (SQLite)**: Banco serverless que replica automaticamente, suficiente para o modelo de dados atual.

5. **Actions/Loaders vs REST API**: Usar actions/loaders do React Router elimina latência de chamadas HTTP entre frontend e backend.

## Segurança

- Rate limiting no edge (Cloudflare)
- WAF (Web Application Firewall)
- Validação de input com Zod
- CORS configurado
- TLS 1.3 automático

## Escalabilidade

- Workers escalam automaticamente
- D1 replica para múltiplas regiões
- KV para cache de hot data
- Turborepo caching para builds

## Referências

- [ROADMAP.md](./ROADMAP.md) - Roadmap de implementação
- [docs/](./docs/) - Documentação canônica
- [Architecture Decision Records](./docs/adr/)
