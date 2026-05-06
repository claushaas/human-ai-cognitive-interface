# Roadmap de Implementação — HACI

Este roadmap transforma o estado atual do repositório em um web app funcional, testado e implantável para o HACI — Human-AI Cognitive Interface. Ele parte do código existente, da documentação em `docs/`, dos artefatos canônicos em `docs/raw inputs/` e das decisões já registradas.

## 1. Estado atual do repositório

### O que já existe

| Área | Estado observado |
| --- | --- |
| Framework | Scaffold React Router 7 em Framework Mode com SSR habilitado. |
| Runtime | Worker Cloudflare em `workers/app.ts` usando `createRequestHandler`. |
| Build | Vite configurado com `@cloudflare/vite-plugin`, `@react-router/dev/vite`, Tailwind e `vite-tsconfig-paths`. |
| TypeScript | `tsconfig.json`, `tsconfig.node.json` e `tsconfig.cloudflare.json` com `strict: true`. |
| Tailwind | Tailwind v4 inicial em `app/app.css`. |
| Biome | `biome.json` existe com lint/format e domínio React habilitado. |
| Cloudflare | `wrangler.jsonc` existe, aponta para `./workers/app.ts`, mas ainda usa nome genérico. |
| Rotas | Apenas rota index em `app/routes/home.tsx`. |
| UI | Tela padrão de template React Router via `app/welcome/welcome.tsx`. |
| Documentação | Documentos canônicos `docs/00-23` existem e cobrem produto, UX, design, runtime, contratos, persistência, LLM, deploy e testes. |
| Artefatos canônicos | `docs/raw inputs/canonical-prompt-generator.json` e `docs/raw inputs/canonical-match.ts` existem. |
| Lockfile | `pnpm-lock.yaml` existe. |

### O que está ausente

| Área | Ausência |
| --- | --- |
| Produto HACI | Nenhuma tela, fluxo ou domínio HACI implementado. |
| Estrutura de domínio | Não há `app/domain/`, `app/features/`, `app/lib/`, `app/components/ui/` ou equivalente. |
| Engine determinístico | Não há implementação do matcher no app; existe apenas artefato bruto em `docs/raw inputs/`. |
| Schemas | Não há Zod instalado nem schemas implementados. |
| Persistência | Não há Drizzle, D1 binding, migrations ou acesso a banco. |
| Autenticação | Não há extração de identidade Cloudflare Access. |
| Rate limiting | Não há lógica de limite diário. |
| LLM | Não há gateway DeepSeek, prompts internos, mock ou validação de output. |
| Histórico | Não há sessões, histórico, exportação, exclusão ou feedback. |
| Testes | Não há Vitest, Playwright, configs de teste, fixtures ou arquivos `*.test.ts`. |
| CI/CD | Não há `.github/workflows/`. |
| Deploy real | Não há envs staging/production, D1 bindings, secrets, domínio ou workflows. |
| Design final | Fontes canônicas, tokens OKLCH, `@clhaas/palette-kit` e componentes base não existem. |
| Internacionalização | A documentação exige pt-BR/en, mas não há i18n implementado. |

### O que está parcialmente presente

- `package.json` contém React, React Router, Cloudflare plugin, Tailwind, TypeScript, Vite, Biome e Wrangler.
- `package.json` não contém `vitest`, `playwright`, `zod`, `drizzle-orm`, `drizzle-kit`, `@clhaas/palette-kit` ou cliente HTTP específico para DeepSeek.
- Script `typecheck` existe e passa no estado atual, mas executa `wrangler types` e atualiza `worker-configuration.d.ts`.
- Script `build` existe e passa no estado atual.
- Script `biome` existe, mas executa `biome check --unsafe --write`; falta script não mutante `biome:check`.
- `wrangler.jsonc` existe, mas usa `name: "react-router-app"`, `VALUE_FROM_CLOUDFLARE` de template e não possui D1, envs, secrets ou domínios.
- `app/root.tsx` carrega Inter e `lang="en"`, divergindo da direção de produto bilíngue e das fontes canônicas Averia Serif Libre/Spectral.
- `app/app.css` tem Tailwind inicial, mas não possui tokens HACI nem OKLCH via `@clhaas/palette-kit`.

### Verificações executadas

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | Passou. Emitiu avisos de configuração npm e aviso de Vite sobre `vite-tsconfig-paths`. Executa `wrangler types`. |
| `pnpm build` | Passou. Gerou build client/server. Emitiu aviso de Vite sobre `vite-tsconfig-paths`. |

### Riscos técnicos imediatos

- O repositório está em estado de scaffold, então quase todo o domínio HACI precisa ser criado do zero.
- O nome do pacote é `appppp`, incompatível com HACI.
- O script `biome` é mutante e inseguro para CI como check; precisa ser separado de `biome:fix`.
- A documentação exige stack completa, mas dependências centrais ainda não estão instaladas.
- O artefato `docs/raw inputs/canonical-match.ts` diverge do JSON em `block.source.closedButResearch`: o JSON inclui `role.explore`, mas o código bruto só bloqueia `role.research`. A implementação deve seguir o JSON e registrar teste para `role.explore`.
- Ainda existem referências textuais a `info/` em alguns documentos consolidados; isso não impede implementação, mas pode confundir rastreabilidade. Não corrigir neste roadmap, apenas tratar como inconsistência documental remanescente.
- A documentação `18-runtime-architecture.md` sugere estrutura com `src/`, enquanto o pedido e o scaffold atual favorecem estrutura dentro de `app/`. Este roadmap adota `app/domain`, `app/lib` e `app/features` para reduzir split desnecessário e aproveitar alias `~/*` já apontando para `app/*`.

### Inconsistências entre documentação e implementação

| Tema | Documentação | Implementação atual |
| --- | --- | --- |
| Produto | HACI, web app privado, prompt generator cognitivo | Template React Router genérico. |
| Runtime | React Router 7 SSR em Cloudflare Workers | Existe scaffold compatível. |
| Persistência | Cloudflare D1 + Drizzle | Ausente. |
| Auth | Cloudflare Access | Ausente. |
| LLM | DeepSeek-V4-Flash com mock no CI | Ausente. |
| Testes | Vitest + Playwright robustos | Ausente. |
| Design | Spectral, Averia Serif, OKLCH, palette-kit | Inter + Tailwind template. |
| Deploy | `haci.claushaas.dev` e `staging.haci.claushaas.dev` | Wrangler genérico sem envs. |

## 2. Princípios de execução

- Implementar em fatias verticais pequenas, sempre mantendo typecheck e build verdes.
- Priorizar o core determinístico antes da LLM real.
- Tratar JSON canônico como fonte de verdade para papéis, réguas, níveis, pesos, thresholds e hard blocks.
- Validar todo input externo com Zod no Worker.
- Manter UI pública simples e termos técnicos apenas no modo debug.
- Nunca chamar LLM no CI.
- Nunca permitir que LLM escolha nível, altere hard blocks ou execute a tarefa final do usuário.
- Persistir dados de sessão no D1, mas não registrar conteúdo completo em logs operacionais.
- Introduzir Cloudflare-specific code apenas em módulos `.server.ts` ou loaders/actions.
- Garantir WCAG AA desde os componentes base.

## 3. Premissas e decisões canônicas

- Nome do projeto: HACI — Human-AI Cognitive Interface.
- Produto: web app utilizável, inicialmente privado, com caminho futuro para produto público.
- Função principal: camada anterior ao chat com IA.
- Output principal: prompt final/canônico para iniciar ou redirecionar conversa com IA.
- MVP não é chat livre e não mantém conversa com usuário.
- Stack: React Router 7 Framework Mode, SSR, Vite, TypeScript, Tailwind puro, Biome, pnpm, Vitest, Playwright, Cloudflare Workers, Cloudflare D1, Drizzle ORM, Cloudflare Access, DeepSeek-V4-Flash.
- Domínios: `haci.claushaas.dev` e `staging.haci.claushaas.dev`.
- Persistência: inputs, contrato, prompt gerado, histórico, feedback, exportação e exclusão lógica.
- Retenção: indefinida até exclusão manual.
- Rate limit inicial: 20 prompts por usuário por dia.
- Dados podem melhorar templates/prompts internos HACI, mas não treinar modelo externo.
- Design: sóbrio, técnico, minimalista, responsivo, WCAG AA, Averia Serif Libre para headings, Spectral para corpo e código, OKLCH via `@clhaas/palette-kit`.
- Papéis expostos: `role.analyze`, `role.synthesize`, `role.explore`, `role.decideSupport`, `role.document`, `role.transform`.
- Réguas expostas: `inference`, `decision`, `scope`, `source`, `meta`.
- `decision` tem cap constitucional `<= 3`; valores `4` e `5` são proibidos.
- Níveis canônicos N1-N8 e vetores devem seguir `docs/raw inputs/canonical-prompt-generator.json`.
- N7/N8 não competem com N1-N6 no mesmo conjunto de escolha apresentado ao usuário.

## 4. Fora de escopo do roadmap

- Chat livre dentro do HACI.
- Execução final da tarefa do usuário pelo HACI.
- Anexos, RAG, tool calling, agentes, automações externas ou integrações com IDEs.
- Marketplace de prompts.
- Colaboração em equipe.
- Compartilhamento público por link.
- Auth pública/comercial complexa.
- Dark mode obrigatório.
- A/B test formal.
- Fine-tuning ou treinamento de modelos externos.
- Multi-provider complexo para LLM.
- Edição direta de sessões persistidas.

## 5. Estratégia geral de implementação

A implementação deve seguir três trilhos sequenciais:

| Trilha | Fases | Resultado |
| --- | --- | --- |
| Fundação | 0-4 | Repositório saneado, runtime, design base, contratos e engine determinístico testados. |
| Produto sem LLM real | 5-7 | Fluxo completo com mock, persistência, histórico, auth e rate limit. |
| Produção | 8-12 | DeepSeek, feedback/export/debug, testes robustos, CI/CD, deploy e hardening. |

Arquitetura recomendada, ajustada ao scaffold atual:

```text
app/
  routes/
  components/
  components/ui/
  features/
    prompt-session/
    rulers/
    collection/
    history/
    debug/
  lib/
    auth/
    db/
    env/
    llm/
    rate-limit/
    validation/
    i18n/
    export/
  domain/
    contracts/
    rulers/
    levels/
    matching/
    collection/
    prompt/
    feedback/
  styles/
  test/
tests/
  unit/
  integration/
  fixtures/
  e2e/
drizzle/
  migrations/
```

Motivo: manter domínio e runtime próximos ao app React Router atual, reutilizar alias `~/*`, evitar introduzir `src/` sem necessidade e preservar boundary puro via convenção de imports.

## 6. Fase 0 — Saneamento, setup e baseline técnico ✅

### Objetivo

Transformar o scaffold genérico em baseline HACI sem implementar o produto, corrigindo scripts, nomes, dependências e configuração mínima para desenvolvimento seguro.

### Entradas

- Estado atual auditado.
- `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `react-router.config.ts`, `wrangler.jsonc`, `biome.json`.
- Decisões de stack em `docs/18-runtime-architecture.md`, `docs/22-deployment.md` e `docs/23-test-strategy.md`.

### Saídas esperadas

- Projeto nomeado como HACI.
- Scripts não mutantes para CI.
- Dependências base instaladas.
- Configs de teste criadas, ainda com testes mínimos.
- Wrangler preparado para evolução, sem deploy real.
- Build e typecheck verdes.

### Etapas acionáveis

- Renomear `package.json.name` de `appppp` para `haci` ou `human-ai-cognitive-interface`.
- Criar script `biome:check` com `biome check .`.
- Renomear script atual `biome` para `biome:fix` ou ajustar para `biome check --write .`, evitando `--unsafe` por padrão.
- Adicionar scripts `test`, `test:watch`, `test:e2e`, `test:e2e:ui`, `build`, `typecheck`, `validate`.
- Instalar dependências futuras necessárias: `zod`, `drizzle-orm`, `drizzle-kit`, `@clhaas/palette-kit`, `vitest`, `@vitest/ui` opcional, `playwright`, `tsx` se necessário para scripts manuais.
- Avaliar remoção de `vite-tsconfig-paths` ou substituir por `resolve.tsconfigPaths: true`, porque Vite 8 avisa que o plugin é redundante.
- Criar `vitest.config.ts` com ambiente adequado para unit tests puros.
- Criar `playwright.config.ts` com `webServer` usando `pnpm dev` e `USE_MOCK_LLM=true`.
- Criar `app/test/` com helpers de teste de domínio e fixtures iniciais vazias.
- Criar `tests/fixtures/README.md` explicando golden tests futuros.
- Ajustar `wrangler.jsonc` para nome `haci` sem adicionar bindings ainda se D1 não existir.
- Registrar no README ou em comentário de script que `pnpm typecheck` executa `wrangler types` e pode atualizar `worker-configuration.d.ts`.

### Arquivos prováveis a criar/alterar

- `package.json`
- `pnpm-lock.yaml`
- `vite.config.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- `wrangler.jsonc`
- `app/test/README.md`
- `tests/fixtures/README.md`

### Testes obrigatórios

- `pnpm typecheck`
- `pnpm biome:check`
- `pnpm test` com pelo menos um teste smoke de configuração.
- `pnpm build`

### Critérios de aceite

- `pnpm install --frozen-lockfile` funciona em máquina limpa.
- `pnpm validate` roda typecheck, Biome check, testes unitários e build.
- Nenhum script de CI altera arquivos.
- O app ainda pode ser executado com `pnpm dev`.
- O nome do Worker e pacote não são mais genéricos.

### Riscos e observações

- Esta fase pode alterar lockfile e configs, mas não deve implementar domínio HACI.
- Não configurar D1 real antes de decidir nomes de bancos e bindings por ambiente.
- Se `@clhaas/palette-kit` não estiver publicamente resolvível, registrar decisão pendente e usar tokens OKLCH estáticos temporariamente.

## 7. Fase 1 — Runtime web e fundação da aplicação ✅

### Objetivo

Criar a fundação SSR do web app HACI, com rotas, shell, loaders/actions mínimos e separação server/client adequada.

### Entradas

- Fase 0 concluída.
- `docs/18-runtime-architecture.md`.
- `docs/16-ux-flow.md`.
- Scaffold atual de React Router.

### Saídas esperadas

- Rotas principais do app criadas.
- Layout shell HACI substitui template.
- App roda localmente sem LLM, sem D1 real obrigatório.
- Boundary de Worker preservado.

### Etapas acionáveis

- Remover dependência visual do template `app/welcome/welcome.tsx` da rota principal.
- Criar rota pública/autenticada inicial em `app/routes/_index.tsx` ou manter index apontando para fluxo principal.
- Criar rotas `app/routes/app.new.tsx`, `app/routes/app.session.$sessionId.tsx`, `app/routes/app.history.tsx`, `app/routes/app.export.$sessionId.tsx` conforme arquitetura de runtime.
- Criar `app/components/shell/AppShell.tsx` com header, área principal, link para histórico e espaço para idioma.
- Criar `app/lib/env/public.ts` para variáveis públicas tipadas.
- Criar `app/lib/env/runtime.server.ts` para leitura server-only de env Cloudflare.
- Criar helper `getCloudflareContext(context)` para loaders/actions, evitando acesso espalhado a `context.cloudflare`.
- Definir `AppEnvironment` com `local`, `staging`, `production`.
- Ajustar `app/root.tsx` para `lang` dinâmico ou default `pt-BR`.
- Trocar metadata padrão de React Router para título e descrição HACI.
- Criar rota health interna simples apenas se necessária para smoke de deploy, por exemplo `app/routes/health.tsx` retornando JSON sem dados sensíveis.

### Arquivos prováveis a criar/alterar

- `app/root.tsx`
- `app/routes.ts`
- `app/routes/_index.tsx`
- `app/routes/app.new.tsx`
- `app/routes/app.session.$sessionId.tsx`
- `app/routes/app.history.tsx`
- `app/routes/app.export.$sessionId.tsx`
- `app/components/shell/AppShell.tsx`
- `app/lib/env/public.ts`
- `app/lib/env/runtime.server.ts`
- `app/lib/env/cloudflare.server.ts`

### Testes obrigatórios

- Unit test para parsing de env público e server.
- Integration test de loader básico sem D1 real usando contexto mockado.
- Build SSR.
- Smoke manual local: abrir home, histórico vazio e nova sessão.

### Critérios de aceite

- O template React Router não aparece mais para o usuário.
- Rotas principais renderizam com SSR.
- Nenhuma rota client chama Cloudflare, D1 ou LLM diretamente.
- `pnpm build` e `pnpm typecheck` passam.

### Riscos e observações

- Cloudflare Access ainda não entra nesta fase.
- D1 ainda pode ser mockado/ausente; loaders devem degradar para estado local controlado.
- Evitar criar API separada; usar loaders/actions como boundary canônico.

## 8. Fase 2 — Design system e shell da interface ✅

### Objetivo

Implementar a linguagem visual HACI, tokens OKLCH, fontes canônicas e componentes base acessíveis em Tailwind puro.

### Entradas

- `docs/17-design-system.md`.
- Decisões de design fornecidas no pedido.
- Fase 1 concluída.

### Saídas esperadas

- App shell visualmente alinhado ao HACI.
- Tokens semânticos OKLCH definidos.
- Componentes mínimos disponíveis para o fluxo.
- Contraste WCAG AA validado manualmente.

### Etapas acionáveis

- Configurar carregamento de Averia Serif Libre para headings.
- Configurar carregamento de Spectral para corpo e código.
- Remover Inter de `app/root.tsx` e `app/app.css`.
- Criar `app/styles/tokens.css` com tokens semânticos `--haci-bg`, `--haci-surface`, `--haci-text`, `--haci-accent`, `--haci-warning`, `--haci-danger`, `--haci-success`, `--haci-focus`.
- Integrar `@clhaas/palette-kit` em script ou módulo determinístico para gerar/validar tokens OKLCH.
- Se `palette-kit` for runtime-inadequado para Worker, gerar tokens em build/dev e persistir CSS estático versionado.
- Criar componentes `Button`, `Card`, `Callout`, `StepIndicator`, `TextArea`, `Field`, `RulerSlider`, `ReviewPanel`, `DebugPanel`, `HistoryList`, `CopyExportActions`, `FeedbackControl`.
- Implementar estados visuais `normal`, `selected`, `ambiguous`, `blocked`, `success`, `debug`, `disabled`.
- Implementar animações suaves com CSS transitions e `prefers-reduced-motion`.
- Garantir foco visível em todos os controles.
- Garantir layout mobile single-column e desktop com largura máxima 720-880px.

### Arquivos prováveis a criar/alterar

- `app/root.tsx`
- `app/app.css`
- `app/styles/tokens.css`
- `app/styles/fonts.css`
- `app/components/ui/Button.tsx`
- `app/components/ui/Card.tsx`
- `app/components/ui/Callout.tsx`
- `app/components/ui/StepIndicator.tsx`
- `app/components/ui/TextArea.tsx`
- `app/components/ui/RulerSlider.tsx`
- `app/components/ui/ReviewPanel.tsx`
- `app/components/ui/DebugPanel.tsx`
- `app/components/ui/HistoryList.tsx`
- `app/components/ui/FeedbackControl.tsx`

### Testes obrigatórios

- Unit tests simples para componentes com estados críticos quando aplicável.
- Testes de acessibilidade básicos para labels, roles e foco.
- Playwright smoke visual em desktop e mobile após app shell estável.
- Verificação manual de contraste WCAG AA nos tokens principais.

### Critérios de aceite

- UI não usa biblioteca visual pesada.
- Fontes canônicas carregam corretamente.
- Tokens estão em OKLCH e documentados no código.
- Componentes mínimos existem e são reutilizáveis.
- Navegação por teclado funciona no shell e componentes base.

### Riscos e observações

- Google Fonts é permitido pela documentação, mas avaliar privacidade/performance futura.
- Spectral para código não é monospace por decisão estética; debug JSON precisa preservar legibilidade mesmo assim.
- Dark mode não é obrigatório, mas tokens devem permitir extensão futura.

## 9. Fase 3 — Contratos de dados e schemas Zod ✅

### Objetivo

Definir contratos v1 como fonte de verdade de validação, derivando tipos TypeScript e preparando dados para domínio, persistência, UI e LLM.

### Entradas

- `docs/19-data-contracts.md`.
- `docs/raw inputs/canonical-prompt-generator.json`.
- `docs/12-constitution.md`.

### Saídas esperadas

- Schemas Zod v1 implementados.
- Tipos TypeScript derivados.
- Fixtures JSON iniciais.
- Validação constitucional de `decision <= 3`.

### Etapas acionáveis

- Criar `app/domain/contracts/version.ts` com `CONTRACT_VERSION = "v1"`.
- Criar `app/domain/contracts/schemas.ts` exportando schemas Zod de `RawIntent`, `InitialRole`, `RulersVector`, `LevelCandidate`, `LevelMatch`, `HardBlock`, `CorrectionSuggestion`, `CognitiveContract`, `CollectionProtocol`, `CollectionQuestion`, `CollectionAnswer`, `PromptGenerationRequest`, `PromptGenerationResult`, `Session`, `Feedback`.
- Criar enums Zod para roles canônicos expostos e roles internos compatíveis.
- Criar enum Zod para `Locale` com `pt-BR` e `en`.
- Criar `Scale1to5Schema` e `DecisionScaleSchema` restrito a `1 | 2 | 3` para entrada de usuário.
- Permitir que tipos internos leiam escala 1-5 quando representam JSON canônico, mas validar entrada pública com cap constitucional.
- Criar `app/domain/contracts/fixtures.ts` ou fixtures JSON em `tests/fixtures/contracts/`.
- Criar helpers `parseOrThrow`, `safeParseWithIssues`, `formatZodIssues` em `app/lib/validation/zod.ts`.
- Criar golden fixtures para contrato válido, contrato com decision 4, locale inválido e resultado LLM inválido.

### Arquivos prováveis a criar/alterar

- `app/domain/contracts/version.ts`
- `app/domain/contracts/schemas.ts`
- `app/domain/contracts/types.ts`
- `app/lib/validation/zod.ts`
- `tests/fixtures/contracts/valid-contract-v1.json`
- `tests/fixtures/contracts/invalid-contract-decision-4.json`
- `tests/fixtures/llm/valid-prompt-result.json`
- `tests/fixtures/llm/invalid-json-result.json`

### Testes obrigatórios

- Validar todos os schemas com dados válidos.
- Falhar para campos obrigatórios ausentes.
- Falhar para enums inválidos.
- Falhar para `decision=4` e `decision=5` em input público.
- Falhar para locale diferente de `pt-BR` e `en`.
- Falhar para output LLM sem `prompt`.

### Critérios de aceite

- Todos os contratos de `docs/19-data-contracts.md` têm schema correspondente.
- Tipos de domínio são inferidos de Zod, não duplicados manualmente.
- Fixtures são legíveis e versionadas.
- O modo debug pode consumir os tipos sem depender de LLM.

### Riscos e observações

- Drizzle terá schema próprio; não tentar fazer Drizzle representar objetos aninhados integralmente.
- Campos JSON versionados são aceitáveis no MVP.
- Manter `RulersVector` interno compatível com escala 1-5, mas UI não deve permitir decisão 4/5.

## 10. Fase 4 — Engine determinístico de réguas, níveis e bloqueios

### Objetivo

Implementar o core puro de papéis, réguas, níveis, distância, hard blocks, thresholds, prior, correções e track selection sem IO e sem LLM.

### Entradas

- `docs/05-initial-roles.md`.
- `docs/06-axes-and-rulers.md`.
- `docs/07-level-matching.md`.
- `docs/09-open-issues-and-gaps.md`.
- `docs/12-constitution.md`.
- `docs/raw inputs/canonical-prompt-generator.json`.
- `docs/raw inputs/canonical-match.ts`.

### Saídas esperadas

- Engine determinístico implementado e coberto por testes.
- JSON canônico transformado em constantes auditáveis.
- Divergência `role.explore` no hard block corrigida na implementação.
- Track selection N1-N6 vs N7-N8 implementada.

### Etapas acionáveis

- Criar `app/domain/roles/roles.ts` com os 6 papéis expostos e 2 internos compatíveis.
- Criar `app/domain/rulers/rulers.ts` com metadata das 5 réguas a partir do JSON canônico.
- Criar `app/domain/levels/levels.ts` com N1-N8 e vetores do JSON, não da tabela markdown alternativa.
- Criar `app/domain/matching/distance.ts` com `computeWeightedDistance`, `computeMaxDistance`, `distanceToScore`.
- Criar `app/domain/matching/hard-blocks.ts` com regras canônicas do JSON.
- Garantir que `block.source.closedButResearch` bloqueia `role.research` e `role.explore` quando `source === 1`.
- Criar `app/domain/matching/prior.ts` para role prior com `maxContribution = 0.15`.
- Criar `app/domain/matching/corrections.ts` com `generateLocalDeltas`, `applyDelta`, `suggestCorrectionsSafe`.
- Criar `app/domain/matching/match-levels.ts` como orquestrador puro.
- Criar `app/domain/matching/track-selection.ts` implementando regra constitucional: `decision === 3` usa operational; senão `meta >= 4` usa meta; senão operational.
- Criar `app/domain/matching/index.ts` com API pública do domínio.
- Criar fixtures golden para N1, N5, bloqueio decisão alta, bloqueio `role.explore` com fonte fechada, ambiguidade N4/N5, N6 exige decisão 3, meta track N7/N8.

### Arquivos prováveis a criar/alterar

- `app/domain/roles/roles.ts`
- `app/domain/rulers/rulers.ts`
- `app/domain/levels/levels.ts`
- `app/domain/matching/distance.ts`
- `app/domain/matching/hard-blocks.ts`
- `app/domain/matching/prior.ts`
- `app/domain/matching/corrections.ts`
- `app/domain/matching/match-levels.ts`
- `app/domain/matching/track-selection.ts`
- `tests/unit/matching/*.test.ts`
- `tests/fixtures/match/*.json`

### Testes obrigatórios

- Unit tests para distância ponderada.
- Unit tests para normalização de score.
- Unit tests para todos os hard blocks canônicos.
- Teste explícito: `source=1` + `role.explore` bloqueia pesquisa/benchmarks.
- Teste explícito: `decision=4` bloqueia.
- Teste explícito: N6 exige `decision=3`.
- Teste explícito: N7/N8 não aparecem junto com N1-N6 na apresentação.
- Golden tests para match forte, match ambíguo e match fraco.
- Testes de correção local com máximo 2 réguas e ±1 por régua.

### Critérios de aceite

- Core não importa React, Cloudflare, Drizzle, fetch ou APIs de navegador.
- Todos os cálculos são determinísticos.
- Testes de engine têm cobertura alta e fixtures legíveis.
- Implementação reflete JSON canônico e decisões de `09-open-issues-and-gaps.md`.

### Riscos e observações

- A documentação chama derivação de critérios de função pura em alguns pontos, mas `14-engineering-blueprint.md` e `21-llm-integration.md` tratam a geração do protocolo como chamada LLM obrigatória. Resolver assim: engine define critérios candidatos/validações determinísticas; LLM compõe protocolo textual estruturado dentro desses limites.

## 11. Fase 5 — Fluxo UX completo sem LLM real

### Objetivo

Implementar o fluxo de UX completo com dados locais/server mockados e geração fake de prompt, sem DeepSeek e sem D1 obrigatório.

### Entradas

- Fases 1-4 concluídas.
- `docs/15-product-spec.md`.
- `docs/16-ux-flow.md`.
- `docs/17-design-system.md`.

### Saídas esperadas

- Usuário consegue percorrer todas as etapas do MVP em memória/mock.
- UI pública usa termos recomendados.
- Debug mostra dados técnicos.
- Nenhuma LLM real é chamada.

### Etapas acionáveis

- Implementar estado de fluxo `idle`, `editing`, `validating`, `matching`, `ambiguous`, `blocked`, `collecting`, `reviewing`, `generating`, `completed`, `failed`.
- Criar feature `app/features/prompt-session/PromptSessionFlow.tsx` como orquestrador UI.
- Criar etapa de entrada inicial com textarea, validação de mínimo de texto e exemplos discretos.
- Criar etapa de papel inicial com cards para os 6 papéis expostos.
- Criar etapa de Ajustes com `RulerSlider` para `inference`, `decision`, `scope`, `source`, `meta`.
- Impedir seleção de decisão 4/5 na UI principal.
- Criar etapa Profundidade que chama engine localmente no action/loader ou no server action, retorna match e apresenta resumo público.
- Criar UI de correções locais aplicáveis com um clique.
- Criar etapa Detalhes necessários usando protocolo mock derivado de fixtures.
- Criar etapa Revisão com intenção, papel, ajustes, detalhes, idioma e formato.
- Criar modo debug recolhível com `RulersVector`, `LevelMatch`, `CognitiveContract`, payloads e versões.
- Criar etapa Gerar com mock de `PromptGenerationResult`.
- Criar Resultado com prompt copiável, botão copiar, exportar mock, novo prompt e feedback mock.

### Arquivos prováveis a criar/alterar

- `app/features/prompt-session/PromptSessionFlow.tsx`
- `app/features/prompt-session/state.ts`
- `app/features/rulers/RulersStep.tsx`
- `app/features/collection/CollectionStep.tsx`
- `app/features/debug/DebugPanel.tsx`
- `app/domain/collection/mock-protocol.ts`
- `app/domain/prompt/mock-generate-prompt.ts`
- `app/routes/app.new.tsx`
- `app/routes/app.session.$sessionId.tsx`

### Testes obrigatórios

- Unit tests para reducer/state machine do fluxo.
- Integration tests para action que calcula match sem LLM.
- Component tests ou integration tests para bloqueio de decisão 4/5.
- Playwright local com mock: completar fluxo principal até prompt fake.
- Playwright mobile viewport para fluxo principal.

### Critérios de aceite

- Fluxo completo funciona sem LLM real e sem D1 real.
- Usuário não vê termos técnicos fora do debug.
- Debug mostra contrato, réguas, nível, payloads e decisões.
- Botão copiar funciona no browser.
- Não há chat livre.

### Riscos e observações

- Evitar construir state machine complexa demais; React Router actions/loaders e estado local podem ser suficientes.
- Se uma etapa depender de server action, manter fallback de teste com mocks.
- O protocolo de coleta mock deve ser substituível pelo output LLM validado na Fase 8.

## 12. Fase 6 — Persistência, sessões e histórico

### Objetivo

Adicionar Cloudflare D1, Drizzle, migrations, persistência de sessão, histórico, exclusão lógica e exportação.

### Entradas

- Fases 3-5 concluídas.
- `docs/20-persistence-and-sessions.md`.
- `docs/19-data-contracts.md`.

### Saídas esperadas

- Banco D1 local configurado.
- Drizzle schema e migrations versionadas.
- Sessões persistidas e retomáveis.
- Histórico, exclusão lógica e exportação funcionam.

### Etapas acionáveis

- Criar `drizzle.config.ts` para schema e migrations.
- Criar binding D1 `HACI_DB` em `wrangler.jsonc` para local/staging/production quando IDs existirem.
- Criar `app/lib/db/schema.ts` com tabelas `users`, `sessions`, `collection_answers`, `feedback`, `rate_limits`.
- Criar migration `drizzle/migrations/0001_initial.sql` compatível com D1 SQLite.
- Criar `app/lib/db/client.server.ts` para Drizzle D1 a partir de `context.cloudflare.env.HACI_DB`.
- Criar `app/lib/db/sessions.server.ts` com `createSession`, `updateSession`, `getSessionForUser`, `listSessionsForUser`, `softDeleteSession`, `savePrompt`, `saveCollectionAnswer`.
- Criar `app/lib/db/users.server.ts` com upsert de usuário local.
- Criar `app/lib/export/session-export.server.ts` para Markdown e JSON debug opcional.
- Atualizar actions do fluxo para persistir input inicial, papel, réguas, match, contrato, respostas, prompt e feedback.
- Criar tela `app.history.tsx` listando sessões não deletadas.
- Criar action de exclusão lógica com checagem de usuário dono.
- Criar action/export loader que impede exportar sessão deletada ou de outro usuário.

### Arquivos prováveis a criar/alterar

- `drizzle.config.ts`
- `wrangler.jsonc`
- `app/lib/db/schema.ts`
- `app/lib/db/client.server.ts`
- `app/lib/db/sessions.server.ts`
- `app/lib/db/users.server.ts`
- `app/lib/export/session-export.server.ts`
- `drizzle/migrations/0001_initial.sql`
- `app/routes/app.history.tsx`
- `app/routes/app.export.$sessionId.tsx`

### Testes obrigatórios

- Integration tests com D1 local/miniflare equivalente para criar usuário.
- Criar sessão `draft` com input válido.
- Atualizar sessão com réguas, match e contrato.
- Salvar prompt final e status `completed`.
- Salvar feedback positivo/negativo.
- Soft delete remove sessão do histórico normal.
- Exportação falha para sessão deletada.
- Usuário A não acessa/exporta sessão do usuário B.

### Critérios de aceite

- Migrations rodam localmente.
- Histórico mostra sessões do usuário autenticado/mockado.
- Sessão pode ser apagada sem exclusão física.
- Sessão pode ser exportada em Markdown.
- Dados complexos são persistidos em JSON `TEXT` versionado quando apropriado.

### Riscos e observações

- D1 local e Drizzle em Workers podem exigir configuração específica; validar cedo.
- Não armazenar conteúdo do usuário em logs.
- Não permitir edição direta de registros persistidos.

## 13. Fase 7 — Autenticação, identidade e rate limiting

### Objetivo

Proteger o MVP privado com Cloudflare Access, extrair identidade do usuário e aplicar limite de 20 prompts por usuário por dia antes da LLM.

### Entradas

- Fase 6 concluída.
- `docs/20-persistence-and-sessions.md`.
- `docs/22-deployment.md`.

### Saídas esperadas

- Auth server-side via headers Cloudflare Access.
- Usuário local criado/atualizado.
- Rate limit diário persistido em D1.
- Dev local tem identidade mock explícita.

### Etapas acionáveis

- Criar `app/lib/auth/access.server.ts` para extrair identidade dos headers Cloudflare Access.
- Definir tipo `AuthenticatedUser` com `id`, `email`, `name?`, `provider` e `accessSubject`.
- Criar `requireUser(request, context)` que retorna usuário ou lança resposta 401/redirect controlado.
- Mapear headers esperados do Cloudflare Access e registrar decisão se `Cf-Access-Authenticated-User-Email` e JWT forem usados.
- Criar fallback local apenas quando `APP_ENV=local` e `DEV_AUTH_EMAIL` estiver configurado.
- Criar `app/lib/rate-limit/rate-limit.server.ts` com `assertPromptDailyLimit(userId)` e `incrementPromptDailyLimit(userId)`.
- Implementar janela diária por UTC ou timezone definida; registrar escolha. Recomenda-se UTC para simplicidade.
- Integrar rate limit antes de qualquer chamada real de LLM.
- Persistir contagem em tabela `rate_limits`.
- Criar mensagem pública para limite excedido.
- Criar debug metadata com contagem restante quando disponível.

### Arquivos prováveis a criar/alterar

- `app/lib/auth/access.server.ts`
- `app/lib/auth/require-user.server.ts`
- `app/lib/rate-limit/rate-limit.server.ts`
- `app/lib/db/users.server.ts`
- `app/lib/db/rate-limits.server.ts`
- `app/routes/*.tsx` que exigem usuário

### Testes obrigatórios

- Headers ausentes falham.
- Headers válidos criam `AuthenticatedUser`.
- Headers incompletos falham de modo controlado.
- Fallback local só funciona em `APP_ENV=local`.
- Rate limit permite 20 gerações.
- Rate limit bloqueia a 21ª geração.
- Sessões abandonadas antes da LLM não consomem limite.
- Erro técnico após chamada LLM pode consumir limite conforme regra documentada.

### Critérios de aceite

- Nenhuma rota privada funciona sem usuário.
- Rate limit é aplicado antes da LLM.
- Limite diário é configurável por `PROMPT_DAILY_LIMIT`.
- Usuário só vê suas sessões.
- CI testa auth com headers mockados, sem Cloudflare real.

### Riscos e observações

- Confirmar nomes exatos dos headers Cloudflare Access no ambiente real.
- Não construir auth custom para MVP.
- Cloudflare Access precisa ser configurado fora do código em staging/production.

## 14. Fase 8 — Integração LLM e geração final de prompt

### Objetivo

Integrar DeepSeek-V4-Flash via gateway server-side, mantendo mock no CI, validação Zod e separação formal entre instruções HACI e conteúdo do usuário.

### Entradas

- Fases 3-7 concluídas.
- `docs/21-llm-integration.md`.
- `docs/14-engineering-blueprint.md`.
- `docs/raw inputs/criteria-collection-protocol-prompt.md`.

### Saídas esperadas

- Interface `LlmClient` implementada.
- Mock determinístico usado em CI/local por padrão.
- DeepSeek real habilitado apenas por env/secrets.
- Derivação de protocolo e geração final de prompt funcionando com validação.

### Etapas acionáveis

- Criar `app/lib/llm/types.ts` com `LlmClient`, `LlmGenerateInput`, `LlmGenerateResult`, `LlmError`.
- Criar `app/lib/llm/mock.server.ts` com fixtures determinísticas para sucesso, JSON inválido, timeout, provider error, resposta vazia e resposta longa demais.
- Criar `app/lib/llm/deepseek.server.ts` com chamada `fetch` server-side usando `DEEPSEEK_API_KEY`.
- Criar `app/lib/llm/client.server.ts` que escolhe mock ou real por `USE_MOCK_LLM`, `LLM_ENABLED`, `APP_ENV`.
- Criar `app/lib/llm/retry.server.ts` com timeout, 1 retry para timeout e 1 repair/retry para JSON inválido.
- Criar prompts versionados em `app/domain/prompt/prompts/v1/derive-criteria.prompt.ts`, `generate-final-prompt.prompt.ts`, `repair-json.prompt.ts`.
- Implementar `deriveCollectionProtocol(contract, initialContext)` chamando LLM e validando `CollectionProtocol`.
- Implementar `generateFinalPrompt(request)` chamando LLM e validando `PromptGenerationResult`.
- Separar prompt interno em seções: instruções HACI, contrato cognitivo, conteúdo do usuário, schema de saída.
- Validar contrato e rate limit antes da chamada.
- Persistir modelo, usage, warnings, latência e prompt final.
- Garantir que output inválido não é aceito silenciosamente.
- Criar kill switch `LLM_ENABLED=false` com erro controlado.

### Arquivos prováveis a criar/alterar

- `app/lib/llm/types.ts`
- `app/lib/llm/mock.server.ts`
- `app/lib/llm/deepseek.server.ts`
- `app/lib/llm/client.server.ts`
- `app/lib/llm/retry.server.ts`
- `app/domain/prompt/prompts/v1/derive-criteria.prompt.ts`
- `app/domain/prompt/prompts/v1/generate-final-prompt.prompt.ts`
- `app/domain/prompt/prompts/v1/repair-json.prompt.ts`
- `app/domain/collection/derive-protocol.server.ts`
- `app/domain/prompt/generate-final-prompt.server.ts`

### Testes obrigatórios

- Mock retorna prompt válido.
- JSON inválido dispara repair/retry controlado.
- Timeout faz no máximo 1 retry.
- Provider rate limit retorna erro amigável.
- `LLM_ENABLED=false` não chama provider.
- CI força mock mesmo com variáveis acidentalmente presentes.
- Prompt interno separa instruções do sistema e conteúdo do usuário.
- Output sem `prompt` falha validação.

### Critérios de aceite

- CI nunca chama DeepSeek real.
- Staging pode chamar DeepSeek real com secret configurado.
- Geração final produz prompt copiável e persistido.
- LLM não escolhe nível nem altera contrato.
- Erros de provider não vazam stack/API key para UI.

### Riscos e observações

- Identificador operacional de DeepSeek-V4-Flash pode variar se usado via gateway. Manter `LLM_MODEL` configurável.
- Chamadas reais ao DeepSeek são validação manual/staging, não gate de CI.
- Não implementar streaming no MVP.

## 15. Fase 9 — Feedback, exportação e modo debug

### Objetivo

Completar os artefatos pós-geração: feedback positivo/negativo, exportação de sessão e debug avançado para auditoria do contrato.

### Entradas

- Fases 5-8 concluídas.
- `docs/15-product-spec.md`.
- `docs/16-ux-flow.md`.
- `docs/20-persistence-and-sessions.md`.

### Saídas esperadas

- Feedback persistido.
- Exportação Markdown funcional.
- Exportação JSON debug opcional.
- Debug panel mostra dados técnicos sem contaminar UI principal.

### Etapas acionáveis

- Implementar `FeedbackControl` com estados `positive`, `negative`, `none`.
- Criar action `submitFeedback(sessionId, value)` com checagem de owner.
- Impedir múltiplos feedbacks conflitantes ou decidir regra de update; recomendação MVP: permitir atualizar valor na mesma sessão.
- Implementar export Markdown com input original, estrutura pública, prompt final, timestamps, idioma e feedback.
- Implementar export JSON debug opcional contendo contrato completo, match, payloads e schemas versionados.
- Criar `DebugPanel` recolhível com termos técnicos permitidos.
- Adicionar redaction no debug quando necessário para não expor secrets ou headers auth.
- Criar eventos mínimos internos: `session.created`, `match.completed`, `generation.started`, `generation.completed`, `generation.failed`, `feedback.created`, `rate_limit.exceeded`.

### Arquivos prováveis a criar/alterar

- `app/features/debug/DebugPanel.tsx`
- `app/features/feedback/FeedbackControl.tsx`
- `app/domain/feedback/feedback.ts`
- `app/lib/db/feedback.server.ts`
- `app/lib/export/session-export.server.ts`
- `app/lib/observability/events.server.ts`
- `app/routes/app.export.$sessionId.tsx`

### Testes obrigatórios

- Feedback positivo persiste.
- Feedback negativo persiste.
- Atualização de feedback segue regra definida.
- Export Markdown contém prompt final e input original.
- Export JSON debug contém contrato e match.
- Exportação de sessão deletada falha.
- Debug não mostra secrets.

### Critérios de aceite

- Usuário consegue copiar, exportar e registrar feedback após gerar prompt.
- Histórico reflete feedback quando aplicável.
- Debug é opt-in/recolhível.
- Termos técnicos não aparecem no fluxo principal fora do debug.

### Riscos e observações

- Feedback textual fica fora do MVP.
- Exportação por link público fica fora do MVP.
- Não registrar conteúdo completo em logs de evento.

## 16. Fase 10 — Testes robustos e qualidade

### Objetivo

Elevar a base de testes para proteger domínio, contratos, persistência, runtime, LLM mockado e fluxo principal.

### Entradas

- Fases 0-9 concluídas.
- `docs/23-test-strategy.md`.

### Saídas esperadas

- Vitest cobre unit e integration.
- Playwright cobre fluxo principal e casos críticos.
- Golden tests protegem matching e contratos.
- CI pronto para falhar em typecheck, Biome, testes e build.

### Etapas acionáveis

- Organizar `tests/unit`, `tests/integration`, `tests/fixtures`, `tests/e2e`.
- Criar fixtures golden para matching, contratos, LLM, sessions e exports.
- Adicionar testes unitários do core determinístico com meta alta de cobertura.
- Adicionar testes de schemas para todos os contratos v1.
- Adicionar integration tests de loaders/actions com contexto Cloudflare mockado.
- Adicionar testes D1/Drizzle com banco local/isolado por teste.
- Adicionar testes de rate limit com janela diária controlada.
- Adicionar testes de auth com headers Cloudflare Access mockados.
- Adicionar testes LLM usando `MockLlmClient`.
- Adicionar Playwright para fluxo principal: input, papel, ajustes, profundidade, detalhes, revisão, gerar, copiar, feedback.
- Adicionar Playwright para bloqueio cognitivo, limite diário, erro LLM, histórico, exportação e mobile.
- Adicionar teste de acessibilidade básico para foco, labels e navegação por teclado.
- Definir cobertura semântica mínima para engine e schemas.

### Arquivos prováveis a criar/alterar

- `tests/unit/**/*.test.ts`
- `tests/integration/**/*.test.ts`
- `tests/e2e/**/*.spec.ts`
- `tests/fixtures/**/*.json`
- `app/test/*.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- `package.json`

### Testes obrigatórios

- `pnpm test`
- `pnpm test:e2e` local/staging conforme maturidade.
- `pnpm typecheck`
- `pnpm biome:check`
- `pnpm build`

### Critérios de aceite

- Core determinístico tem cobertura alta e golden tests.
- CI não depende de LLM real.
- Tests de integração validam loaders/actions críticos.
- E2E principal passa com LLM mockado.
- Erros de auth, rate limit e LLM têm cobertura.

### Riscos e observações

- E2E pode não bloquear merge até shell estabilizar; depois deve bloquear fluxo principal.
- Não perseguir 100% global artificial; priorizar regressões semânticas.
- Evitar snapshots frágeis de UI inteira.

## 17. Fase 11 — CI/CD e deploy

### Objetivo

Configurar GitHub Actions, Wrangler, D1 bindings, secrets, deploy local/staging/production, rollback manual e validação pós-deploy.

### Entradas

- Fases 0-10 concluídas.
- `docs/22-deployment.md`.
- Cloudflare account/domínios disponíveis.

### Saídas esperadas

- CI em GitHub Actions.
- Wrangler com env staging/production.
- D1 local/staging/production configurado.
- Deploy staging manual.
- Deploy production a partir de `main` com checks verdes.
- Runbook básico de rollback.

### Etapas acionáveis

- Criar `.github/workflows/ci.yml` com install, typecheck, Biome check, unit/integration tests e build.
- Criar `.github/workflows/deploy-staging.yml` com `workflow_dispatch`.
- Criar `.github/workflows/deploy-production.yml` acionado por push/tag em `main` após CI verde.
- Configurar `wrangler.jsonc` ou migrar para `wrangler.toml` se necessário para envs e D1 com clareza.
- Definir Worker production `haci` e staging `haci-staging`.
- Configurar D1 `haci-production` e `haci-staging` com binding `HACI_DB`.
- Criar scripts `db:migrate:local`, `db:migrate:staging`, `db:migrate:production`.
- Configurar secrets Cloudflare: `DEEPSEEK_API_KEY`, `SESSION_EXPORT_SECRET`.
- Configurar vars: `APP_ENV`, `PUBLIC_BASE_URL`, `PUBLIC_DEFAULT_LOCALE`, `PUBLIC_SUPPORTED_LOCALES`, `LLM_MODEL`, `LLM_TIMEOUT_MS`, `LLM_MAX_RETRIES`, `LLM_TEMPERATURE`, `PROMPT_DAILY_LIMIT`, `LLM_ENABLED`, `USE_MOCK_LLM`.
- Configurar Cloudflare Access para staging e production.
- Configurar domínios `staging.haci.claushaas.dev` e `haci.claushaas.dev`.
- Criar checklist pós-deploy: health, auth, D1, mock off em staging, geração real controlada, histórico, exportação.
- Definir rollback manual por redeploy de tag anterior e cuidado com migrations backward-compatible.
- Definir tags `v0.1.0`, `v0.1.1`, `v0.2.0`.

### Arquivos prováveis a criar/alterar

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`
- `wrangler.jsonc` ou `wrangler.toml`
- `package.json`
- `drizzle.config.ts`
- `docs/24-implementation-roadmap.md` se decisões operacionais forem atualizadas futuramente

### Testes obrigatórios

- CI em pull request falha em typecheck, Biome, unit tests ou build.
- CI usa LLM mockado.
- Staging smoke: login Access, criar prompt, geração DeepSeek controlada, histórico, exportação.
- Production smoke: health, Access, home, histórico vazio ou existente.

### Critérios de aceite

- Pull requests têm checks obrigatórios.
- Staging deploy é manual e validável.
- Production deploy só ocorre com checks verdes.
- D1 bindings existem nos dois ambientes.
- Secrets não estão no repositório.
- Rollback manual documentado e testado pelo menos uma vez em staging.

### Riscos e observações

- Produção não deve aplicar migration destrutiva automaticamente.
- Preview deploy por branch está fora do MVP.
- Chamadas reais ao DeepSeek devem ser limitadas em staging para evitar custo inesperado.

## 18. Fase 12 — Hardening final e release candidate

### Objetivo

Preparar `v0.1.0` com segurança, privacidade, acessibilidade, observabilidade mínima e critérios objetivos de aceite globais.

### Entradas

- Fases 0-11 concluídas.
- Staging funcional.
- Testes principais verdes.

### Saídas esperadas

- Release candidate implantado em staging.
- Checklist de produção concluído.
- `v0.1.0` pronto para produção privada.

### Etapas acionáveis

- Revisar todos os logs para garantir que não contêm input completo, prompt final, contrato completo ou secrets.
- Validar que conteúdo de usuário persistido fica no D1, não em logs técnicos.
- Validar redaction de erros LLM.
- Validar Cloudflare Access em staging e production.
- Validar rate limit real por usuário.
- Validar exclusão lógica e exportação.
- Validar que dados podem ser usados internamente para melhorar HACI, mas não treinar modelo externo; expor aviso mínimo na UI se necessário.
- Fazer revisão manual WCAG AA: contraste, foco, labels, teclado, mobile.
- Fazer teste manual real com DeepSeek em staging com baixo volume.
- Fazer smoke production com LLM desativável por kill switch antes de liberar uso privado.
- Criar tag `v0.1.0` após produção validada.

### Arquivos prováveis a criar/alterar

- Pequenos ajustes em `app/lib/observability/*`
- Pequenos ajustes em `app/components/ui/*`
- Pequenos ajustes em workflows ou Wrangler
- Release notes se adotadas futuramente

### Testes obrigatórios

- Suite completa CI.
- Playwright fluxo principal.
- Smoke staging com DeepSeek real.
- Smoke production sem dados sensíveis.
- Teste manual de exclusão/exportação.
- Teste manual de rate limit excedido.

### Critérios de aceite

- `main` verde.
- Staging validado com Cloudflare Access, D1 e DeepSeek.
- Production validado com Cloudflare Access e D1.
- CI nunca chama LLM real.
- Usuário consegue gerar, copiar, exportar, ver histórico, apagar sessão e enviar feedback.
- Nenhum requisito MVP documentado está ausente sem registro em riscos/pendências.

### Riscos e observações

- Hardening pode revelar lacunas de produto, especialmente i18n, acessibilidade e logs.
- Se DeepSeek real estiver indisponível, release privada pode ocorrer apenas se mock/kill switch estiver claro e geração real for bloqueada com mensagem honesta; caso contrário, adiar release.

## 19. Matriz de dependências entre fases

| Fase | Depende de | Pode rodar sem LLM real | Depende de Cloudflare real | Observação |
| --- | --- | --- | --- | --- |
| 0 | Auditoria | Sim | Não | Instala/configura baseline. |
| 1 | 0 | Sim | Não | Runtime local SSR. |
| 2 | 1 | Sim | Não | Design e componentes. |
| 3 | 0 | Sim | Não | Schemas puros. |
| 4 | 3 | Sim | Não | Core determinístico puro. |
| 5 | 1,2,3,4 | Sim | Não | Fluxo completo com mock. |
| 6 | 3,5 | Sim | Parcial | D1 local primeiro, staging depois. |
| 7 | 6 | Sim | Staging/production sim | Auth real depende de Access. |
| 8 | 3,4,6,7 | CI sim; staging não | Sim para secrets/deploy | DeepSeek real só fora do CI. |
| 9 | 6,8 | Sim | Parcial | Feedback/export/debug. |
| 10 | 0-9 | Sim | Não para CI | E2E pode usar local mockado. |
| 11 | 10 | Sim no CI | Sim | Deploy real. |
| 12 | 11 | Não para smoke real | Sim | Release candidate. |

## 20. Critérios globais de aceite

- O app está implantado em `staging.haci.claushaas.dev` e `haci.claushaas.dev`.
- Cloudflare Access protege staging e production.
- Usuário autenticado consegue criar uma sessão de prompt do início ao fim.
- Fluxo principal não é chat livre e não permite pular etapas no MVP.
- Usuário informa intenção, escolhe papel, ajusta réguas, vê profundidade, preenche detalhes, revisa, gera prompt, copia, exporta e envia feedback.
- O core determinístico decide match, bloqueios, thresholds, prior e correções sem LLM.
- `decision` 4/5 nunca é aceito pela UI principal nem pelos schemas públicos.
- N7/N8 não aparecem competindo com N1-N6 no mesmo conjunto de escolha.
- LLM só gera protocolo/prompt dentro de contrato validado e nunca executa tarefa final.
- Persistência salva input, réguas, match, contrato, respostas, prompt, metadata, feedback e histórico.
- Usuário pode apagar sessão e exportar sessão.
- Rate limit de 20 prompts por usuário por dia é aplicado antes da LLM.
- CI falha em erro de typecheck, Biome, unit/integration tests ou build.
- CI não depende de LLM real.
- E2E principal passa com mock quando app shell estiver estável.
- Logs operacionais não contêm conteúdo completo do usuário, prompt final, contrato completo ou secrets.
- Design é responsivo, usa Tailwind puro, fontes canônicas e tokens OKLCH, com contraste WCAG AA.

## 21. Riscos, pendências e decisões futuras

| Item | Tipo | Status recomendado |
| --- | --- | --- |
| Headers exatos do Cloudflare Access | Decisão pendente | Confirmar em staging antes de fechar auth. |
| `@clhaas/palette-kit` | Risco técnico | Confirmar disponibilidade e API; fallback para tokens OKLCH estáticos. |
| `vite-tsconfig-paths` em Vite 8 | Saneamento | Remover plugin ou usar `resolve.tsconfigPaths`. |
| `canonical-match.ts` bruto diverge do JSON em `role.explore` | Risco de regressão | Implementar a partir do JSON e testar explicitamente. |
| Derivação de critérios determinística vs LLM obrigatória | Clarificação | Usar determinístico para limites/schemas e LLM para compor protocolo textual validado. |
| i18n pt-BR/en | Escopo MVP | Implementar sem dependência pesada; definir strings antes de E2E. |
| Wrangler JSONC vs TOML | Decisão técnica | Manter JSONC se suportar envs claramente; migrar para TOML se simplificar D1/envs. |
| Dark mode | Futuro | Fora do MVP obrigatório, mas tokens devem permitir. |
| Auth pública futura | Futuro | Cloudflare Access é MVP privado; não antecipar Clerk/Auth0 agora. |
| Exclusão física | Futuro | MVP usa soft delete. |
| Feedback textual | Futuro | MVP usa positivo/negativo. |
| Preview deployments por branch | Futuro | Fora do MVP. |
| Observabilidade avançada | Futuro | MVP usa logs Cloudflare + metadados D1. |

## 22. Ordem recomendada de execução

1. Executar Fase 0 para tornar o scaffold seguro para desenvolvimento e CI.
2. Executar Fase 3 em paralelo parcial com Fase 1, porque schemas e runtime têm baixa dependência entre si.
3. Executar Fase 4 antes de qualquer UX complexa, garantindo que o modelo cognitivo está protegido por testes.
4. Executar Fase 2 para criar os componentes que a UX usará.
5. Executar Fase 5 para validar a jornada completa sem LLM real nem D1 real.
6. Executar Fase 6 para persistir sessões, histórico, exportação e feedback base.
7. Executar Fase 7 para proteger uso privado e aplicar rate limit.
8. Executar Fase 8 para substituir mocks por DeepSeek em staging, mantendo mock no CI.
9. Executar Fase 9 para fechar artefatos pós-geração e debug.
10. Executar Fase 10 para elevar cobertura e bloquear regressões.
11. Executar Fase 11 para CI/CD, staging e production.
12. Executar Fase 12 para hardening, smoke real e release `v0.1.0`.
