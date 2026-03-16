# ADR 004: Simplificação para Repositório Único

## Status

Aceito

## Contexto

O projeto foi inicialmente estruturado como um monorepo com Turborepo (ver ADR 001), com múltiplos pacotes:
- `apps/web` - Aplicação web React Router v7
- `apps/raycast` - Extensão Raycast
- `packages/core` - Motor canônico
- `packages/types` - Tipos TypeScript
- `packages/config` - Configurações JSON
- `packages/ui` - Componentes compartilhados

Após revisão da arquitetura, identificamos que essa estrutura adicionava complexidade desnecessária.

## Decisão

Simplificar para um **repositório único** sem monorepo tooling.

## Justificativa

### 1. Escopo Focado
- Teremos apenas a versão web como produto principal
- A extensão Raycast pode ser mantida em repositório separado ou consumir a API web
- Versão mobile futura pode consumir a API via loaders/actions do React Router v7

### 2. Complexidade Reduzida
- Sem necessidade de Turborepo
- Sem workspaces do pnpm
- Sem versionamento entre pacotes
- Build e deploy mais simples

### 3. Manutenibilidade
- Mais fácil para novos contribuidores entenderem
- Menos arquivos de configuração
- CI/CD mais simples

## Nova Estrutura

```
/
├── app/              # React Router v7 application
│   ├── root.tsx
│   ├── routes/
│   └── components/
├── core/             # Motor canônico (match, derivação)
│   ├── match/
│   └── derivation/
├── config/           # JSONs canônicos
├── types/            # Tipos TypeScript
├── workers/          # Cloudflare Worker handlers
├── db/               # Database schema
├── public/           # Assets estáticos
├── package.json      # Single package (sem workspaces)
├── tsconfig.json
├── vite.config.ts
├── react-router.config.ts
└── wrangler.toml
```

## Importações

Antes:
```typescript
import { calculateMatch } from '@haci/core';
import type { RulersVector } from '@haci/types';
```

Depois:
```typescript
import { calculateMatch } from '~/core';
import type { RulersVector } from '~/types';
```

## Consequências

### Positivas
- Menor complexidade de tooling
- Builds mais rápidos
- CI/CD simplificado
- Mais fácil de manter

### Negativas
- Menos isolamento entre módulos
- Sem caching de builds do Turborepo
- Raycast precisa ser mantido separadamente

## Referências

- [ADR 001: Monorepo com Turborepo](./001-monorepo-with-turborepo.md) (reversado)
- [ROADMAP.md - Etapa 0.15](../ROADMAP.md)
