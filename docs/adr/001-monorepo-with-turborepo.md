# ADR 001: Monorepo com Turborepo (Reversado)

## Status

**Reversado** em favor de repositório simples (ver Etapa 0.15)

## Contexto (Original)

O projeto começou como uma extensão Raycast simples em um repositório único. Conforme o escopo cresceu para incluir:
- Web app (React Router v7)
- Extensão Raycast (existente)
- Packages compartilhados (types, core, config, ui)
- Mobile app (futuro)

A necessidade de compartilhar código entre múltiplas aplicações tornou-se evidente.

## Decisão (Original)

Adotar um monorepo gerenciado por **Turborepo**.

## Reversão

Em março de 2026, após análise mais profunda, decidimos **reverter** para uma estrutura de repositório simples pelos seguintes motivos:

### Motivos para Reversão

1. **Escopo Reduzido**: O projeto terá apenas a versão web como produto principal
2. **Mobile via API**: Uma versão mobile futura pode consumir a API via loaders/actions do React Router v7
3. **Simplificação**: Menor complexidade de tooling (sem Turborepo, workspaces, etc.)
4. **Manutenção**: Mais simples de entender e manter para contribuidores

### Estrutura Resultante

```
/
├── app/              # React Router v7 app
├── core/             # Motor canônico
├── config/           # JSONs canônicos
├── types/            # Tipos TypeScript
├── workers/          # Cloudflare Workers
└── package.json      # Single package, no workspaces
```

## Lições Aprendidas

- Monorepo é valioso quando há múltiplas aplicações com releases independentes
- Para projetos focados em uma única aplicação web, a complexidade não se justifica
- O React Router v7 com actions/loaders permite "API embutida" sem necessidade de separação backend/frontend

## Referências

- [ADR 004: Simplificação para Repositório Único](./004-simplificacao-repo-unico.md) (novo)
- [ROADMAP.md - Etapa 0.15](./ROADMAP.md)
