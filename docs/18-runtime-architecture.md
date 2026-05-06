<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 18 — Arquitetura de Runtime

## 1. Decisão canônica

O HACI será implementado como aplicação web em:

- React Router 7;
- Framework Mode;
- SSR;
- Vite;
- TypeScript;
- Tailwind;
- Cloudflare Workers;
- Biome;
- pnpm.

O Worker será o boundary único do MVP: frontend, SSR, loaders/actions e API interna vivem no mesmo runtime.

## 2. Objetivo arquitetural

A arquitetura deve preservar a separação entre:

1. **UI** — interação, estados visuais e acessibilidade;
2. **core determinístico** — matching, bloqueios, correções, validações;
3. **contratos de dados** — schemas Zod e tipos derivados;
4. **persistência** — D1/Drizzle;
5. **LLM gateway** — chamadas controladas ao DeepSeek;
6. **deploy/runtime** — Cloudflare Workers.

O objetivo é permitir implementação rápida sem misturar regras cognitivas com detalhes de UI ou provider.

## 3. Stack

```text
Runtime: Cloudflare Workers
Framework: React Router 7 Framework Mode
Build: Vite
Language: TypeScript
Styling: Tailwind CSS
Formatting/Linting: Biome
Package manager: pnpm
Database: Cloudflare D1
ORM: Drizzle ORM
Validation: Zod
Tests: Vitest + Playwright
LLM: DeepSeek-V4-Flash
Auth: Cloudflare Access
```

## 4. SSR

SSR é decisão canônica.

Razões:

- loaders/actions podem acessar D1 e secrets com segurança;
- o client não chama LLM diretamente;
- autenticação via Cloudflare Access fica no boundary do Worker;
- rate limit pode ser aplicado no servidor;
- a arquitetura fica mais próxima de um produto multiusuário real.

Não haverá streaming no MVP.

## 5. Worker único

O MVP usa um Worker único para:

- servir assets;
- renderizar SSR;
- executar loaders;
- executar actions;
- validar contratos;
- persistir sessões;
- aplicar rate limit;
- chamar LLM;
- exportar sessão.

APIs separadas ficam fora do MVP.

## 6. Estrutura de diretórios recomendada

```text
app/
  routes/
    _index.tsx
    app.tsx
    app.new.tsx
    app.session.$sessionId.tsx
    app.history.tsx
    app.export.$sessionId.tsx
  components/
    shell/
    flow/
    forms/
    debug/
    output/
  lib/
    i18n/
    ui/
    clipboard/
    export/
  styles/
    tailwind.css

src/
  domain/
    roles.ts
    rulers.ts
    levels.ts
    constitution.ts
  engine/
    match-levels.ts
    hard-blocks.ts
    corrections.ts
    collect-criteria.ts
    prompt-compiler.ts
  contracts/
    schemas.ts
    examples/
  server/
    auth.server.ts
    db.server.ts
    rate-limit.server.ts
    llm.server.ts
    sessions.server.ts
    export.server.ts
  db/
    schema.ts
    migrations/
  config/
    public.ts
    runtime.server.ts

tests/
  unit/
  integration/
  fixtures/
  e2e/

wrangler.toml
vite.config.ts
react-router.config.ts
biome.json
drizzle.config.ts
```

## 7. Boundaries

### Client

Responsabilidades:

- renderizar UI;
- capturar input;
- mostrar estados;
- permitir cópia/exportação;
- exibir debug;
- enviar forms/actions para o Worker.

O client não deve:

- acessar D1 diretamente;
- chamar DeepSeek diretamente;
- validar segurança final sozinho;
- aplicar rate limit sozinho;
- conter secrets.

### Server/Worker

Responsabilidades:

- autenticação;
- validação com Zod;
- aplicação do core determinístico;
- persistência;
- rate limit;
- chamada LLM;
- geração/exportação de artefatos;
- logging de metadados.

### Core determinístico

Deve ser puro, testável e sem dependência de IO.

Não deve importar:

- React;
- Cloudflare runtime;
- Drizzle;
- fetch para LLM;
- APIs de navegador.

## 8. Fluxo de runtime

1. Usuário acessa app autenticado via Cloudflare Access.
2. Loader carrega sessão atual ou estado inicial.
3. Usuário preenche entrada e ajustes.
4. Action valida payload com Zod.
5. Engine calcula match, bloqueios e correções.
6. Se necessário, UI retorna para coleta/ajuste.
7. Quando contrato estiver válido, action gera prompt.
8. Worker chama DeepSeek-V4-Flash via gateway configurado.
9. Output é validado.
10. Input e prompt gerado são persistidos no D1.
11. Resultado é retornado ao client.

## 9. Configuração

### Variáveis públicas

```text
PUBLIC_APP_NAME=HACI
PUBLIC_BASE_URL=https://haci.claushaas.dev
PUBLIC_DEFAULT_LOCALE=pt-BR
PUBLIC_SUPPORTED_LOCALES=pt-BR,en
```

### Secrets

```text
DEEPSEEK_API_KEY=...
LLM_MODEL=deepseek-v4-flash
SESSION_EXPORT_SECRET=...
```

Se o modelo for usado via OpenRouter ou outro gateway, `LLM_MODEL` deve conter o identificador operacional adequado, mantendo `DeepSeek-V4-Flash` como modelo canônico de produto.

## 10. Cloudflare bindings

MVP mínimo:

```text
D1: HACI_DB
```

Fora do MVP inicial:

- KV;
- R2;
- Durable Objects;
- Queues;
- Vectorize.

## 11. Rate limit

Limite inicial:

```text
20 prompts por usuário por dia
```

O limite deve ser configurável por variável de ambiente.

Identificador de usuário:

- preferir identidade fornecida por Cloudflare Access;
- fallback local apenas para desenvolvimento.

## 12. Ambientes

| Ambiente | URL | Observação |
|---|---|---|
| local | localhost | `wrangler dev` |
| staging | `staging.haci.claushaas.dev` | deploy manual |
| production | `haci.claushaas.dev` | deploy da branch `main` |

## 13. Internacionalização

A documentação é pt-BR, mas o website deve suportar pt-BR e inglês.

Implementação recomendada:

```text
app/lib/i18n/
  pt-BR.ts
  en.ts
```

Não usar dependência pesada de i18n no MVP, salvo necessidade real.

## 14. Observabilidade mínima

Registrar metadados:

- user id hash/identificador Access;
- session id;
- timestamp;
- etapa;
- sucesso/erro;
- latência;
- modelo usado;
- tokens se disponíveis;
- custo se disponível;
- feedback positivo/negativo.

Não registrar conteúdo completo do usuário em logs operacionais. O conteúdo persistido deve ficar no D1 como dado de sessão, não em logs de infraestrutura.

## 15. Segurança

- Secrets apenas no Cloudflare.
- Client nunca recebe API key.
- Validar tudo no Worker.
- Aplicar rate limit antes de chamar LLM.
- LLM mockado em CI.
- Não executar ações externas.
- Não aceitar anexos no MVP.
- Separar instruções de sistema de conteúdo do usuário.

## 16. Não objetivos

- Microserviços.
- Worker separado para API.
- Monorepo.
- Publicar core como npm package.
- Offline mode.
- Execução autônoma de tarefas.
