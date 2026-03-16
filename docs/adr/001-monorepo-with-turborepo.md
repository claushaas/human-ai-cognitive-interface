# ADR 001: Monorepo com Turborepo

## Status

Aceito

## Contexto

O projeto começou como uma extensão Raycast simples em um repositório único. Conforme o escopo cresceu para incluir:
- Web app (React Router v7)
- Extensão Raycast (existente)
- Packages compartilhados (types, core, config, ui)
- Mobile app (futuro)

A necessidade de compartilhar código entre múltiplas aplicações tornou-se evidente.

## Decisão

Adotar um monorepo gerenciado por **Turborepo**.

## Alternativas Consideradas

### 1. Repositórios Separados (Multi-repo)

**Prós:**
- Isolamento completo entre projetos
- Deploys independentes simples

**Contras:**
- Dificuldade em compartilhar código (types, core)
- Versionamento complexo entre packages
- Overhead de manutenção de múltiplos repos

### 2. Nx

**Prós:**
- Muito poderoso
- Excelente para projetos enterprise
- Computação distribuída

**Contras:**
- Curva de aprendizado mais íngreme
- Overkill para o tamanho atual do projeto
- Configuração mais complexa

### 3. Turborepo (Escolhido)

**Prós:**
- Simples de configurar
- Caching eficiente de builds
- Integração nativa com pnpm
- Bom para projetos de médio porte
- Documentação clara

**Contras:**
- Menos features que Nx
- Ecossistema menor

## Consequências

### Positivas
- Código compartilhado via `workspace:*`
- Builds cacheados aceleram CI/CD
- Comandos unificados via `turbo run`
- Fácil adicionar novos apps/packages

### Negativas
- Curva de aprendizado inicial para contribuidores
- Necessidade de entender o conceito de pipelines

## Referências

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [ROADMAP.md - Etapa 0.1](./ROADMAP.md)
