<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 22 — Deploy

## 1. Decisão canônica

Deploy em Cloudflare Workers com React Router 7 Framework Mode, Vite e SSR.

Ambientes:

- local;
- staging;
- production.

Domínios:

```text
production: https://haci.claushaas.dev
staging:    https://staging.haci.claushaas.dev
```

## 2. Estratégia

- Branch `main` deploya para produção.
- Staging é manual.
- Não haverá preview deployment por branch no MVP.
- Releases serão tagueadas.
- Rollback será manual.

## 3. Ferramentas

```text
pnpm
Biome
Vitest
Playwright
Wrangler
Drizzle
GitHub Actions
```

## 4. Ambientes

### Local

Usar:

```bash
pnpm install
pnpm dev
```

ou, quando necessário:

```bash
wrangler dev
```

Local deve suportar:

- SSR;
- actions/loaders;
- D1 local;
- LLM mockado por padrão, salvo configuração explícita.

### Staging

URL:

```text
https://staging.haci.claushaas.dev
```

Uso:

- validação manual;
- testes com Cloudflare Access;
- testes com D1 real/staging;
- chamadas reais controladas ao DeepSeek.

### Production

URL:

```text
https://haci.claushaas.dev
```

Deploy a partir da branch `main`.

## 5. Wrangler

`wrangler.toml` deve estar versionado.

Estrutura conceitual:

```toml
name = "haci"
main = "./build/server/index.js"
compatibility_date = "2026-05-05"

[assets]
directory = "./build/client"

[[d1_databases]]
binding = "HACI_DB"
database_name = "haci-production"
database_id = "..."

[env.staging]
name = "haci-staging"

[[env.staging.d1_databases]]
binding = "HACI_DB"
database_name = "haci-staging"
database_id = "..."
```

A configuração exata pode variar conforme adapter de React Router/Cloudflare usado.

## 6. Secrets

Secrets devem ficar no Cloudflare, nunca no repositório.

Secrets mínimos:

```text
DEEPSEEK_API_KEY
SESSION_EXPORT_SECRET
```

Configuração operacional:

```text
LLM_MODEL=deepseek-v4-flash
LLM_TIMEOUT_MS=30000
LLM_MAX_RETRIES=1
LLM_TEMPERATURE=0.3
PROMPT_DAILY_LIMIT=20
```

## 7. GitHub Actions

Checks obrigatórios:

1. install;
2. typecheck;
3. Biome;
4. unit tests;
5. build;
6. deploy.

Workflow conceitual:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm biome:check
      - run: pnpm test
      - run: pnpm build
```

Deploy pode ser job separado.

## 8. Deploy production

Produção a partir de `main`.

Condições:

- checks verdes;
- migrations aplicadas;
- secrets configurados;
- Cloudflare Access ativo;
- domínio apontado.

## 9. Deploy staging

Staging manual.

Pode usar:

```bash
pnpm deploy:staging
```

ou GitHub Actions com `workflow_dispatch`.

## 10. Migrations D1

Migrations devem rodar explicitamente.

Exemplo:

```bash
pnpm db:migrate:local
pnpm db:migrate:staging
pnpm db:migrate:production
```

Produção não deve aplicar migration destrutiva automaticamente sem revisão.

## 11. Rollback

Rollback manual.

Estratégias:

- redeploy de release/tag anterior;
- rollback via Cloudflare dashboard;
- manter migrations backward-compatible quando possível.

Regra:

> Código pode voltar; schema precisa ser planejado para não quebrar rollback simples.

## 12. Releases

Releases serão tagueadas.

Formato sugerido:

```text
v0.1.0
v0.1.1
v0.2.0
```

MVP inicial: `v0.1.0`.

## 13. Observabilidade

MVP mínimo:

- Cloudflare logs;
- eventos de erro no Worker;
- metadados de geração no D1;
- contagem de prompts por usuário;
- status de chamadas LLM.

Eventos mínimos:

- `session.created`
- `session.updated`
- `match.completed`
- `generation.started`
- `generation.completed`
- `generation.failed`
- `feedback.created`
- `rate_limit.exceeded`

## 14. Redação de logs

Logs não devem conter:

- input completo;
- prompt final;
- contrato completo;
- respostas de coleta completas.

Logs podem conter:

- IDs;
- status;
- etapa;
- erro;
- latência;
- modelo;
- tokens;
- custo.

## 15. Cloudflare Access

MVP protegido por Cloudflare Access.

Configurar:

- policy para usuários permitidos;
- proteção nos domínios staging e production;
- identity headers disponíveis ao Worker.

## 16. Domínios

Production:

```text
haci.claushaas.dev
```

Staging:

```text
staging.haci.claushaas.dev
```

Ambos devem estar configurados na Cloudflare.

## 17. Variáveis por ambiente

### Local

```text
APP_ENV=local
PUBLIC_BASE_URL=http://localhost:5173
USE_MOCK_LLM=true
```

### Staging

```text
APP_ENV=staging
PUBLIC_BASE_URL=https://staging.haci.claushaas.dev
USE_MOCK_LLM=false
```

### Production

```text
APP_ENV=production
PUBLIC_BASE_URL=https://haci.claushaas.dev
USE_MOCK_LLM=false
```

## 18. Segurança operacional

- Secrets rotacionáveis.
- Rate limit ativo.
- Cloudflare Access obrigatório.
- LLM desativável por kill switch.
- CI sem LLM real.
- Erros técnicos não expõem stack trace ao usuário.

Variável sugerida:

```text
LLM_ENABLED=true
```

Se `false`, geração deve retornar mensagem controlada.

## 19. Não objetivos

- Preview deploy por branch.
- Kubernetes.
- Servidor Node permanente.
- Banco externo.
- Multi-region custom.
- Observabilidade paga obrigatória.
