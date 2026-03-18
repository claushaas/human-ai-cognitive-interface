# Roadmap de Implementação — Human-AI Cognitive Interface

> **Versão**: 1.0
> **Data**: 2026-03-16
> **Baseado em**: Documentação canônica (`docs/00-index.md` a `docs/13-system-flow-diagram.md`)
> **Estado atual**: Protótipo Raycast (`src/canonical-prompt-generator.tsx`)

---

## Visão Geral do Roadmap

Este roadmap estrutura a implementação completa do **Human-AI Cognitive Interface**, desde o estado atual (protótipo Raycast simples) até um sistema distribuído, determinístico e auditável, com API, banco de dados, UI web e mobile.

**Arquitetura de Destino**: Sistema em camadas com separação estrita entre:
1. **Camada de Configuração/Contrato** (Etapa 0-1): Determinística, vetorial, auditável
2. **Camada de Coleta** (Etapa 2): Modo preparação, derivação de critérios
3. **Camada de Execução** (Etapa 3): Fora de escopo do sistema (delegação)

---

## FASE 0: Fundamentos e Arquitetura Base

### Etapa 0.1: Estruturação do Projeto - ✅

**Objetivo**: Configurar projeto React Router v7 Framework com deploy em Cloudflare Workers.

#### Tarefas:

1. **Estrutura de Diretórios**
   - Criar estrutura de repositório único:
     ```
     /
     ├── app/                      # React Router v7 Framework app
     │   ├── root.tsx
     │   ├── routes/               # Rotas da aplicação
     │   │   ├── _index.tsx
     │   │   ├── session.new.tsx
     │   │   ├── session.$id.stage-0.tsx
     │   │   ├── session.$id.stage-1.tsx
     │   │   └── session.$id.stage-2.tsx
     │   ├── components/           # Componentes React
     │   └── lib/                  # Utilitários
     ├── core/                     # Motor canônico (match, derivação)
     │   ├── match/
     │   ├── derivation/
     │   └── prompts/
     ├── config/                   # JSONs canônicos
     ├── types/                    # Tipos TypeScript
     ├── workers/                  # Cloudflare Worker handlers
     │   └── app.ts
     ├── db/                       # Schema D1
     ├── public/                   # Assets estáticos
     ├── docs/                     # Documentação existente
     ├── .github/workflows/        # CI/CD
     ├── package.json              # Single package
     ├── tsconfig.json             # TypeScript config
     ├── vite.config.ts            # Vite config
     ├── react-router.config.ts    # RR7 config
     └── wrangler.toml             # Cloudflare Workers config
     ```

2. **Configuração de Tooling**
   - **pnpm** como package manager
   - **Biome** para lint/format
   - **Tailwind CSS 4.x** para estilização
   - **GitHub Actions** para CI/CD
   - **Wrangler CLI** para deploy Cloudflare Workers

3. **Setup Tailwind CSS 4.x**
   ```bash
   pnpm add -D tailwindcss @tailwindcss/vite
   ```
   - Configurar `vite.config.ts` com plugin do Tailwind:
     ```typescript
     import { defineConfig } from "vite";
     import tailwindcss from "@tailwindcss/vite";

     export default defineConfig({
       plugins: [tailwindcss()],
     });
     ```
   - Criar `app/styles.css`:
     ```css
     @import "tailwindcss";
     ```
   - Importar no `app/root.tsx`:
     ```typescript
     import "./styles.css";
     ```

4. **Documentação Técnica Inicial**
   - Criar `ARCHITECTURE.md` com C4 diagrams
   - Definir contratos de API (via types TypeScript)
   - Documentar decisões de arquitetura (ADR)

**Referências**:
- `docs/12-constitution.md` (regra de precedência JSON → Código → Markdown)
- `docs/04-process-phases.md` (separação de regimes)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/)

---

### Etapa 0.15: Simplificação da Estrutura (Remover Monorepo) - ✅

**Objetivo**: Simplificar a arquitetura removendo o monorepo, mantendo apenas a aplicação web como foco principal.

**Justificativa**:
- Teremos apenas a versão web como produto principal
- Uma versão mobile futura pode consumir a API via loaders/actions do React Router v7
- A extensão Raycast pode ser mantida em repositório separado ou consumir a API web
- Menor complexidade de tooling (sem Turborepo, workspaces, etc.)

#### Tarefas:

1. **Reestruturação para Repositório Simples**
   - Remover estrutura monorepo (`apps/`, `packages/`)
   - Consolidar código em estrutura plana:
     ```
     /
     ├── app/                    # React Router v7 app
     │   ├── root.tsx
     │   ├── routes/
     │   └── components/
     ├── core/                   # Motor canônico
     ├── config/                 # JSONs canônicos
     ├── types/                  # Tipos TypeScript
     ├── workers/                # Cloudflare Worker
     ├── db/                     # Schema D1
     └── public/                 # Assets
     ```

2. **Atualizar Configurações**
   - Remover `turbo.json`, `pnpm-workspace.yaml`
   - Atualizar `package.json` (dependências sem workspace)
   - Atualizar `tsconfig.json` (paths simplificados)
   - Criar `vite.config.ts`, `react-router.config.ts`
   - Mover `wrangler.toml` para raiz

3. **Atualizar Importações**
   - Substituir `@haci/*` por imports relativos ou `~/`
   - Configurar path aliases no tsconfig

4. **Atualizar CI/CD**
   - Simplificar workflows (sem pnpm workspaces)
   - Remover scripts de monorepo

5. **Atualizar Documentação**
   - Revisar `ARCHITECTURE.md`
   - Atualizar ADR 001 ou criar ADR novo sobre decisão de simplificação

**Referências**:
- Plano detalhado: `.claude/plans/etapa-0.15-simplificacao.md`

---

### Etapa 0.2: Sistema de Tipos Canônicos - ✅

**Objetivo**: Implementar tipos TypeScript que espelhem fielmente as definições canônicas.

#### Tarefas:

1. **Tipos de Dados Base** (`types/core.ts`)
   ```typescript
   export type Scale1to5 = 1 | 2 | 3 | 4 | 5;

   export type RulerId = "inference" | "decision" | "scope" | "source" | "meta";

   export type RulersVector = Record<RulerId, Scale1to5>;

   export type CanonicalLevelId = "N1" | "N2" | "N3" | "N4" | "N5" | "N6" | "N7" | "N8";

   export type InitialRoleId =
     | "role.analyze"
     | "role.synthesize"
     | "role.explore"
     | "role.decideSupport"
     | "role.document"
     | "role.transform";
   ```

2. **Tipos de Contrato** (`types/contract.ts`)
   ```typescript
   export type CognitiveContract = {
     role: InitialRoleId;
     levelMatch: {
       selectedLevel: CanonicalLevelId;
       score: number;
       candidates: Array<{
         level: CanonicalLevelId;
         score: number;
       }>;
     };
     rulers: RulersVector;
     hardBlocks: HardBlock[];
     correction?: LocalCorrection;
   };
   ```

3. **Tipos de Modo de Operação** (`types/mode.ts`)
   ```typescript
   export type OperationMode =
     | "MODE_PREPARATION"
     | "MODE_GOVERNANCE"
     | "MODE_EXECUTION";
   ```

4. **Tipos de Critérios** (`types/criteria.ts`)
   ```typescript
   export type CriterionId =
     | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7"
     | "C8" | "C9" | "C10" | "C11" | "C12" | "C13" | "C14";

   export type CollectionBlock = {
     id: string;
     title: string;
     instruction: string;
     include: string[];
     avoid: string[];
     example: string;
     rationale: string;
   };

   export type CollectionProtocol = {
     protocolVersion: string;
     role: InitialRoleId;
     level: CanonicalLevelId;
     rulers: RulersVector;
     implicitCriteria: CriterionId[];
     criteria: CollectionBlock[];
     blockingIssue?: string;
     question?: string;
     collectionPayloadSchema: unknown;
   };
   ```

**Referências**:
- `docs/03-terminology-and-naming.md`
- `docs/01-source-of-truth.md` (trecho de `canonical-match.ts`)

---

### Etapa 0.3: Configuração Canônica como Código (JSONs) - ✅

**Objetivo**: Criar os arquivos JSON canônicos que servem como fonte de verdade.

#### Tarefas:

1. **Níveis Canônicos** (`config/canonical-levels.json`)
   ```json
   {
     "version": "1.0.0",
     "levels": [
       {
         "id": "N1",
         "name": "Execução Estritamente Delimitada",
         "vector": { "inference": 1, "decision": 1, "scope": 1, "source": 1, "meta": 1 }
       },
       {
         "id": "N2",
         "name": "Análise Controlada e Diagnóstico",
         "vector": { "inference": 2, "decision": 1, "scope": 2, "source": 1, "meta": 1 }
       },
       {
         "id": "N3",
         "name": "Síntese Estruturada e Organização Cognitiva",
         "vector": { "inference": 3, "decision": 1, "scope": 3, "source": 1, "meta": 1 }
       },
       {
         "id": "N4",
         "name": "Exploração de Alternativas e Trade-offs",
         "vector": { "inference": 4, "decision": 1, "scope": 4, "source": 2, "meta": 1 }
       },
       {
         "id": "N5",
         "name": "Apoio à Decisão Humana",
         "vector": { "inference": 4, "decision": 2, "scope": 4, "source": 2, "meta": 2 }
       },
       {
         "id": "N6",
         "name": "Governança, Controle e Segurança Cognitiva",
         "vector": { "inference": 2, "decision": 3, "scope": 5, "source": 1, "meta": 3 }
       },
       {
         "id": "N7",
         "name": "Meta-Cognição e Arquitetura de Pensamento",
         "vector": { "inference": 3, "decision": 1, "scope": 4, "source": 2, "meta": 5 }
       },
       {
         "id": "N8",
         "name": "Documentação, Contratos e Sistemas de Uso",
         "vector": { "inference": 2, "decision": 2, "scope": 5, "source": 1, "meta": 5 }
       }
     ]
   }
   ```

2. **Réguas Cognitivas** (`config/cognitive-rulers.json`)
   ```json
   {
     "version": "1.0.0",
     "rulers": {
       "inference": {
         "label": "Inferência",
         "scale": [1, 2, 3, 4, 5],
         "labels": {
           "1": "Nenhuma inferência (apenas dados explícitos)",
           "2": "Inferência mínima (conexões óbvias)",
           "3": "Inferência moderada (contexto implícito)",
           "4": "Inferência ampla (padrões e implicações)",
           "5": "Inferência máxima (leitura entre linhas)"
         }
       },
       "decision": {
         "label": "Decisão",
         "scale": [1, 2, 3],
         "constitutionalCap": 3,
         "labels": {
           "1": "Nenhuma recomendação/priorização",
           "2": "Recomendação leve (com justificativa; decisão final humana)",
           "3": "Governança/bloqueio (autoridade para parar, bloquear e exigir clarificação)"
         }
       },
       "scope": {
         "label": "Escopo",
         "scale": [1, 2, 3, 4, 5],
         "labels": {
           "1": "Local (item único)",
           "2": "Contextual (relacionamentos próximos)",
           "3": "Departamental/área",
           "4": "Organizacional/projeto",
           "5": "Sistêmico/ecossistema"
         }
       },
       "source": {
         "label": "Fonte",
         "scale": [1, 2, 3, 4, 5],
         "labels": {
           "1": "Fechada (apenas o que foi fornecido)",
           "2": "Fechada com complementação controlada",
           "3": "Parcialmente aberta (contexto geral)",
           "4": "Aberta (pesquisa limitada)",
           "5": "Totalmente aberta (pesquisa extensiva)"
         }
       },
       "meta": {
         "label": "Função Meta",
         "scale": [1, 2, 3, 4, 5],
         "labels": {
           "1": "Operacional (no conteúdo)",
           "2": "Tático (processo e conteúdo)",
           "3": "Estratégico (arquitetura do pensamento)",
           "4": "Reflexivo (pensamento sobre o pensamento)",
           "5": "Meta-arquitetural (sistemas de cognição)"
         }
       }
     }
   }
   ```

3. **Papéis Iniciais** (`config/initial-roles.json`)
   ```json
   {
     "version": "1.0.0",
     "roles": [
       {
         "id": "role.analyze",
         "label": "Analisar",
         "description": "Entender algo que já existe",
         "semanticLoad": ["leitura", "interpretação", "diagnóstico"],
         "blockedBehaviors": ["criação gratuita", "execução", "decisão"]
       },
       {
         "id": "role.synthesize",
         "label": "Organizar / Sintetizar",
         "description": "Estruturar conteúdo existente",
         "semanticLoad": ["estrutura", "clareza", "coerência"],
         "blockedBehaviors": ["invenção de conteúdo"]
       },
       {
         "id": "role.explore",
         "label": "Explorar alternativas",
         "description": "Ver caminhos possíveis sem decidir",
         "semanticLoad": ["expansão", "comparação", "trade-offs"],
         "blockedBehaviors": ["resposta única prematura", "tom prescritivo"]
       },
       {
         "id": "role.decideSupport",
         "label": "Apoiar decisão",
         "description": "Ajudar a pensar, mas decisão é humana",
         "semanticLoad": ["recomendação", "justificativa"],
         "blockedBehaviors": ["decidir por"]
       },
       {
         "id": "role.document",
         "label": "Documentar / Formalizar",
         "description": "Transformar em algo oficial e reutilizável",
         "semanticLoad": ["precisão terminológica", "rastreabilidade"],
         "blockedBehaviors": ["tom informal", "explicações vagas"]
       },
       {
         "id": "role.transform",
         "label": "Transformar conteúdo",
         "description": "Mudar forma, formato ou estrutura",
         "semanticLoad": ["tradução", "reformatação", "reestruturação"],
         "blockedBehaviors": ["mudança sem justificativa"]
       }
     ]
   }
   ```

4. **Hard Blocks** (`config/hard-blocks.json`)
   ```json
   {
     "version": "1.0.0",
     "rules": [
       {
         "id": "block.decision.totalOrHigh",
         "description": "decision ≥ 4 é proibido",
         "condition": "rulers.decision >= 4",
         "action": "BLOCK",
         "message": "Valores 4 e 5 na régua 'decision' são proibidos constitucionalmente"
       },
       {
         "id": "block.source.closedButResearch",
         "description": "Fonte fechada bloqueia papéis de pesquisa",
         "condition": "rulers.source == 1 AND (role == 'role.explore' OR role == 'role.research')",
         "action": "BLOCK",
         "message": "Escopo de fonte fechada é incompatível com papéis de exploração/pesquisa"
       },
       {
         "id": "block.inferenceHighWithClosedSource",
         "description": "Inferência alta com fonte fechada é instável",
         "condition": "rulers.inference >= 4 AND rulers.source == 1",
         "action": "WARN",
         "message": "Alta inferência com fonte fechada pode produzir resultados não verificáveis"
       },
       {
         "id": "block.metaHighAgainstOperational",
         "description": "Meta alta conflita com objetivo operacional",
         "condition": "rulers.meta >= 4 AND rulers.scope <= 2",
         "action": "CONFIRM",
         "message": "Função meta elevada em escopo local requer confirmação de intenção"
       },
       {
         "id": "block.scopeSystemicWithoutSystemicIntent",
         "description": "Escopo sistêmico sem intenção sistêmica",
         "condition": "rulers.scope >= 4 AND role IN ['role.analyze', 'role.document']",
         "action": "CONFIRM",
         "message": "Escopo sistêmico requer papel compatível (synthesize, explore, decideSupport)"
       },
       {
         "id": "block.governanceRequiresDecision3",
         "description": "N6 exige decision = 3",
         "condition": "levelMatch.selectedLevel == 'N6' AND rulers.decision != 3",
         "action": "BLOCK",
         "message": "Nível N6 requer decision = 3 (governança/bloqueio)"
       }
     ]
   }
   ```

5. **Catálogo de Critérios** (`config/criteria-catalog.json`)
   Implementar C1-C14 conforme `docs/08-criteria-and-collection-protocol.md`

6. **Algoritmo de Derivação** (`config/derivation-rules.json`)
   Implementar regras R0-R8 conforme `info/criteria-derivation-algorithm.md`

**Referências**:
- `docs/12-constitution.md` (precedência JSON → Código → Markdown)
- `docs/07-level-matching.md` (tabela de níveis, hard blocks)
- `docs/05-initial-roles.md` (papéis canônicos)

---

## FASE 1: Motor Canônico (Core Engine)

### Etapa 1.1: Motor de Match de Níveis - ✅

**Objetivo**: Implementar funções puras para cálculo de match entre vetores de réguas e níveis canônicos.

#### Tarefas:

1. **Cálculo de Distância** (`core/match/distance.ts`)
   ```typescript
   export function calculateWeightedManhattanDistance(
     userVector: RulersVector,
     levelVector: RulersVector,
     weights: Record<RulerId, number>
   ): number {
     return Object.entries(userVector).reduce((sum, [key, value]) => {
       const rulerId = key as RulerId;
       const diff = Math.abs(value - levelVector[rulerId]);
       return sum + (weights[rulerId] ?? 1) * diff;
     }, 0);
   }
   ```

2. **Pesos Canônicos** (`core/match/weights.ts`)
   ```typescript
   export const DEFAULT_RULER_WEIGHTS: Record<RulerId, number> = {
     inference: 1.0,
     decision: 1.5,
     scope: 1.2,
     source: 1.5,
     meta: 1.3,
   };
   ```

3. **Score Normalizado** (`core/match/score.ts`)
   ```typescript
   export function normalizeScore(
     distance: number,
     maxDistance: number
   ): number {
     return Math.max(0, Math.min(100, 100 * (1 - distance / maxDistance)));
   }
   ```

4. **Prior por Papel** (`core/match/priors.ts`)
   - Implementar boost de score condicionado ao papel inicial
   - Máximo contribuição: 0.15 (15%)
   - Tabela de boosts em JSON config

5. **Hard Blocks** (`core/match/hard-blocks.ts`)
   ```typescript
   export function evaluateHardBlocks(
     contract: CognitiveContract
   ): HardBlockResult[] {
     // Avaliar todas as regras de hard-blocks.json
     // Retornar lista de blocks ativos
   }
   ```

6. **Thresholds** (`core/match/thresholds.ts`)
   ```typescript
   export const DEFAULT_THRESHOLDS = {
     autoSelectMin: 90,      // Auto-seleção se score >= 90
     candidatesMin: 70,      // Apenas candidatos >= 70
     blockBelow: 70,         // Bloqueia se máximo < 70
     maxCandidates: 3,       // Máximo de candidatos retornados
   };
   ```

7. **Sugestão de Correções** (`core/match/corrections.ts`)
   - Gerar deltas discretos (máx. 2 réguas, ±1 cada)
   - Sem loop (aplicação one-shot)
   - Retornar 2-3 alternativas de correção

8. **Seleção de Track** (`core/match/track-selection.ts`)
   Implementar regra de `docs/12-constitution.md` seção 5.1:
   - Se `decision == 3`: apenas operational (N1-N6)
   - Senão se `meta >= 4`: apenas meta (N7-N8)
   - Senão: apenas operational

**Testes Unitários**:
- Testar cálculo de distância com vetores conhecidos
- Testar cada hard block individualmente
- Testar thresholds com scores de fronteira
- Testar track selection para todas as combinações

**Referências**:
- `docs/07-level-matching.md`
- `docs/12-constitution.md` (seções 3, 5, 6)

---

### Etapa 1.2: Motor de Derivação de Critérios - ✅

**Objetivo**: Implementar função pura que deriva critérios de coleta a partir do contrato.

#### Tarefas:

1. **Regras de Derivação** (`core/derivation/rules.ts`)
   Implementar R0-R8:
   - **R0**: C1 (Objetivo Operacional) sempre incluído
   - **R1**: C2 (Artefato) quando nível exige output estruturado
   - **R2**: C13 (Contexto Técnico) normalizado para `role.transform` + `scope >= 4`
   - **R3**: C5 (Limites de Inferência) quando `inference >= 3`
   - **R4**: C6 (Autoridade/Decisão) quando `decision >= 2`
   - **R5**: C7 (Execução vs Preparação) sempre em modo preparation
   - **R6**: C8/C9 (Transformações) quando `role.transform` ou `role.synthesize`
   - **R7**: C10/C11/C12 quando nível exige validação estruturada
   - **R8**: Ordenação UX (C1 primeiro, C14 último)

2. **Critérios Implícitos** (`core/derivation/implicit.ts`)
   - Identificar quais critérios são satisfeitos pelo próprio contrato
   - Marcar como `implicitCriteria` no protocolo

3. **Ordenação de Blocos** (`core/derivation/ordering.ts`)
   - Priorizar critérios com dependências
   - Reduzir fadiga cognitiva (simplicidade primeiro)

4. **Geração de Blocos** (`core/derivation/blocks.ts`)
   - Transformar critérios em blocos de coleta
   - Personalizar instruction com base no contrato
   - Incluir micro-exemplos alinhados

**Testes Unitários**:
- Testar cada regra R0-R8 com combinações de entrada
- Testar ordenação com critérios interdependentes
- Testar geração de blocos para cada C1-C14

**Referências**:
- `docs/08-criteria-and-collection-protocol.md`
- `docs/09-open-issues-and-gaps.md` (seção 5 - normalização C13)

---

### Etapa 1.3: Motor de Prompt (Templates) - ✅

**Objetivo**: Criar templates de prompt para cada etapa/fase.

#### Tarefas:

1. **Prompt de Match/Contrato** (`core/prompts/contract.ts`)
   - Template para explicar o contrato cognitivo ao usuário
   - Incluir explicação de nível, réguas, hard blocks
   - Formato: Markdown estruturado

2. **Prompt de Protocolo de Coleta** (`core/prompts/collection.ts`)
   - **CRÍTICO**: Incluir proibição central (não executar tarefa final)
   - Template dinâmico baseado no catálogo de critérios
   - Instruções de personalização por bloco

3. **Prompt de Execução** (fora de escopo, mas interface definida)
   - `core/prompts/execution-interface.ts`
   - Define como o contrato + inputs coletados se transformam em instrução final

4. **Sistema de Templates** (`core/prompts/engine.ts`)
   - Engine de substituição de variáveis
   - Validação de templates (todos os placeholders devem ser preenchidos)

**Testes**:
- Verificar que todos os placeholders são substituídos
- Validar que proibição de execução está presente no prompt de coleta

**Referências**:
- `docs/04-process-phases.md`
- `docs/08-criteria-and-collection-protocol.md` (seção 2)

---

## FASE 2: API e Backend

### Etapa 2.1: Estrutura da API (Cloudflare Workers) - ✅

**Objetivo**: Implementar API serverless usando Cloudflare Workers (via React Router v7 actions/loaders).

#### Opções de Arquitetura:

- API implementada via `loader` e `action` functions nas rotas
- Server-side rendering com acesso ao banco D1
- Mais simples, menos latência (não há chamada HTTP entre web e API)

#### Tarefas:

1. **Setup API no React Router v7**
   - Actions e Loaders em cada rota
   - Acesso ao D1 via `context.cloudflare.env.DB`
   - Exemplo:
     ```typescript
     // app/routes/session.$id.tsx
     export async function loader({ params, context }: LoaderFunctionArgs) {
       const db = context.cloudflare.env.DB;
       const session = await db.prepare(
         "SELECT * FROM sessions WHERE id = ?"
       ).bind(params.id).first();
       return json({ session });
     }

     export async function action({ request, context }: ActionFunctionArgs) {
       const db = context.cloudflare.env.DB;
       const formData = await request.formData();
       // Processar e salvar no D1
     }
     ```

2. **Persistência (Cloudflare D1)**
   - **Banco**: Cloudflare D1 (SQLite serverless)
   - **ORM**: Drizzle (melhor suporte para D1) ou raw SQL
   - **Schema SQL para D1**:
     ```sql
     -- Sessions
     CREATE TABLE sessions (
       id TEXT PRIMARY KEY,
       mode TEXT NOT NULL,
       current_stage INTEGER NOT NULL DEFAULT 0,
       contract TEXT,
       protocol TEXT,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
     );

     -- Contracts
     CREATE TABLE contracts (
       id TEXT PRIMARY KEY,
       session_id TEXT REFERENCES sessions(id),
       role TEXT NOT NULL,
       level_match TEXT NOT NULL,
       rulers TEXT NOT NULL,
       hard_blocks TEXT,
       correction TEXT,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
     );

     -- Collection Protocols
     CREATE TABLE collection_protocols (
       id TEXT PRIMARY KEY,
       session_id TEXT REFERENCES sessions(id),
       contract_id TEXT REFERENCES contracts(id),
       criteria TEXT NOT NULL,
       blocks TEXT NOT NULL,
       payload TEXT,
       status TEXT DEFAULT 'pending'
     );
     ```

3. **Cache e Estado**
   - **D1**: Persistência durável (PostgreSQL-like)
   - **Cache API**: Cache HTTP no edge para respostas imutáveis
   - **KV**: Configurações canônicas (JSONs), templates

---

### Etapa 2.2: Actions de Contrato (Etapa 1) - ✅

**Objetivo**: Implementar actions do React Router para criação e match de contratos cognitivos.

#### Tarefas:

1. **Action: Iniciar Sessão** (`app/routes/session.new.tsx`)
   - Form submission para criar nova sessão
   - Entrada: `role` (InitialRoleId)
   - Saída: Redirect para `/session/:id/stage-1` com `sessionId`
   - Modo inicial: `MODE_PREPARATION`

2. **Action: Calcular Match** (`app/routes/session.$id.stage-1.tsx`)
   - Entrada: `rulers` (RulersVector) do form
   - Processo:
     1. Calcular distâncias para todos os níveis
     2. Aplicar hard blocks
     3. Aplicar thresholds
     4. Sugerir correções se necessário
     5. Selecionar track (operational vs meta)
   - Saída: `levelMatch` (com score e candidatos), `hardBlocks` ativos, `suggestedCorrections`

3. **Action: Aplicar Correção** (`app/routes/session.$id.stage-1.tsx`)
   - Entrada: `correction` (delta a aplicar)
   - Restrição: máx. 2 réguas, ±1 cada, aplicação one-shot
   - Saída: `levelMatch` atualizado

4. **Action: Confirmar Contrato** (`app/routes/session.$id.stage-1.tsx`)
   - Confirma contrato final
   - Salva no D1
   - Transita para próxima etapa
   - Redirect para `/session/:id/stage-2`

5. **Loader: Recuperar Contrato** (`app/routes/session.$id.tsx` - layout)
   - Carrega dados da sessão e contrato no layout
   - Disponibiliza via `useLoaderData` para todas as sub-rotas

**Testes de Integração**:
- Fluxo completo: iniciar → match → correção → confirmar
- Testar cada hard block via action
- Testar thresholds de score

---

### Etapa 2.3: Actions de Coleta (Etapa 2) - ✅

✅ **Concluída**: Implementado loader e actions para protocolo de coleta em `app/routes/session.$id.stage-2.tsx`

**Objetivo**: Implementar actions do React Router para derivação e execução do protocolo de coleta.

#### Tarefas:

1. **Action: Derivar Protocolo** (`app/routes/session.$id.stage-2.tsx`)
   - Executado automaticamente no loader da rota (se não existir protocolo)
   - Processo: executar motor de derivação (R0-R8)
   - Salva blocos no D1
   - Saída: `collectionProtocol` com blocos ordenados

2. **Loader: Carregar Blocos** (`app/routes/session.$id.stage-2.tsx`)
   - Carrega blocos de coleta do D1
   - Identifica próximo bloco pendente
   - Retorna dados para renderização do formulário

3. **Action: Submeter Resposta** (`app/routes/session.$id.stage-2.tsx`)
   - Entrada: `blockId`, `response` do form
   - Valida resposta contra schema do bloco
   - Armazena no `payload` no D1
   - Retorna redirect para próximo bloco ou tela de completude

4. **Action: Completar Coleta** (`app/routes/session.$id.stage-2.tsx`)
   - Marca protocolo como completo
   - Valida que todos os critérios obrigatórios foram satisfeitos
   - Gera payload final para execução
   - Transita para `MODE_EXECUTION` (ou mostra resultado final)

5. **Server-Sent Events (Alternativa a WebSocket)**
   - Cloudflare Workers suporta SSE (WebSocket em Workers é experimental)
   - Para progresso de coleta em tempo real (se necessário)
   - Ou usar polling otimista com React Query

**Testes**:
- Derivação com diferentes combinações de papel + réguas
- Validação de respostas contra schemas
- Completude do protocolo

**Referências**:
- `docs/08-criteria-and-collection-protocol.md`

---

### Etapa 2.4: Validação e Governança - ✅

**Objetivo**: Implementar validações e bloqueios nas actions do React Router.

#### Tarefas:

1. **Validação de Modo nas Actions**
   - Verificar modo da sessão no início de cada action
   - Bloquear operações incompatíveis (ex.: execução em modo preparation)
   - Retornar erro com `json({ error }, { status: 400 })` se violado

2. **Validação de Cap Constitucional**
   - Validar `decision <= 3` em todas as entradas de réguas
   - Rejeitar com erro 400 se violado
   - Retornar mensagem canônica do bloqueio

3. **Rate Limiting (Cloudflare)**
   - Configurar Rate Limiting no dashboard Cloudflare (nível edge)
   - Limites por IP e por sessão
   - Proteção contra brute force em match

4. **Logging e Auditoria (Cloudflare)**
   - Log de todas as decisões de match via `console.log` (aparecem no Cloudflare Logs)
   - Log de aplicação de hard blocks
   - Log de correções aplicadas
   - Trail de auditoria completo (para compliance)
   - Opcional: enviar logs para serviço externo (Datadog, etc.) via Cloudflare Logpush

**Referências**:
- `docs/12-constitution.md` (limites constitucionais)

---

## FASE 3: Interface Web

### Etapa 3.1: Setup Frontend - ✅

**Objetivo**: Criar aplicação web com React Router v7 Framework para interface do sistema.

#### Tarefas:

1. **Setup React Router v7 Framework** (`app/`, `workers/`)
   - Criar projeto com `npx create-react-router@latest` (ou via template)
   - Estrutura de rotas em `app/routes.ts`
   - File-based routing opcional

2. **Estrutura de Componentes (React Router v7 Framework)**
   ```
   app/
   ├── routes.ts                 # Configuração de rotas (flat routes)
   ├── root.tsx                  # Root layout e providers
   ├── entry.client.tsx          # Entry point client-side
   ├── entry.server.tsx          # Entry point server-side (SSR)
   ├── routes/                   # Páginas/Routes
   │   ├── _index.tsx            # Landing page (/)
   │   ├── session.$id.tsx       # Layout de sessão
   │   ├── session.$id.stage-0.tsx   # Papel inicial
   │   ├── session.$id.stage-1.tsx   # Réguas + Match
   │   ├── session.$id.stage-2.tsx   # Coleta
   │   └── session.new.tsx       # Nova sessão
   ├── components/
   │   ├── stages/               # Componentes por etapa
   │   ├── ui/                   # Componentes base (com Tailwind)
   │   └── forms/                # Inputs customizados
   ├── hooks/                    # React hooks
   ├── lib/
   │   ├── api.ts               # Cliente HTTP
   │   └── utils.ts             # Utilitários
   ├── styles.css               # Tailwind CSS entry
   └── types/                    # Tipos locais (reexport de ~/types)
   ```

3. **Estilização com Tailwind CSS 4.x**
   - CSS-first configuration (sem `tailwind.config.js`)
   - Import via CSS: `@import "tailwindcss";`
   - Variantes customizadas via `@theme`:
     ```css
     @theme {
       --color-primary: #3b82f6;
       --color-secondary: #64748b;
       --font-sans: "Inter", system-ui, sans-serif;
     }
     ```
   - Componentes utilitários:
     - Layout: `flex`, `grid`, `container`, `mx-auto`
     - Espaçamento: `p-4`, `m-2`, `gap-4`
     - Tipografia: `text-lg`, `font-semibold`, `leading-relaxed`
     - Cores: `bg-white`, `text-slate-900`, `border-slate-200`
   - Dark mode: `dark:` variant

4. **Estado Global**
   - Zustand ou Redux Toolkit para estado de sessão
   - React Query (TanStack Query) para server state

4. **Data Loading e Actions (React Router v7)**
   - **Loaders**: Carregamento de dados no servidor (`loader` function em cada rota)
   - **Actions**: Mutations via `action` function
   - **useLoaderData**: Hook para acessar dados carregados
   - **useFetcher**: Para interações otimistas e formulários
   - **Form**: Componente nativo do RR para submissões

5. **Configuração de Rotas** (`app/routes.ts`)
   ```typescript
   import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

   export default [
     index("routes/_index.tsx"),
     route("session/new", "routes/session.new.tsx"),
     route("session/:id", "routes/session.$id.tsx", [
       route("stage-0", "routes/session.$id.stage-0.tsx"),
       route("stage-1", "routes/session.$id.stage-1.tsx"),
       route("stage-2", "routes/session.$id.stage-2.tsx"),
     ]),
   ] satisfies RouteConfig;
   ```

6. **SSR e Hydration**
   - SSR configurado via `entry.server.tsx`
   - Streaming de dados com `ReadableStream`
   - HMR com React Refresh

---

### Etapa 3.2: Etapa 0 — Seleção de Papel

**Objetivo**: UI para escolha do papel inicial (Stage 1).

#### Tarefas:

1. **Tela de Introdução**
   - Explicação do sistema
   - Call-to-action: "Iniciar nova sessão"

2. **Componente de Seleção de Papel**
   - Grid de 6 cards (papéis canônicos) usando `grid grid-cols-2 md:grid-cols-3 gap-4`
   - Cada card com Tailwind:
     - Container: `bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`
     - Ícone representativo: `w-12 h-12 text-primary mb-4`
     - Label (Analisar, Sintetizar, etc.): `text-lg font-semibold text-slate-900`
     - Descrição curta: `text-sm text-slate-600 mt-2`
     - Hover: `hover:border-primary hover:bg-slate-50`
   - Seleção única (radio behavior) com estado visual: `ring-2 ring-primary`
   - Animações: `transition-all duration-200`

3. **Confirmação**
   - Resumo da seleção
   - Botão "Confirmar e Continuar"
   - POST para `/api/v1/contracts/initiate`

4. **Navegação**
   - Usar `redirect` no loader/action ou `useNavigate` no componente
   - Redirecionar para `/session/:id/stage-1` após criação

**Referências**:
- `docs/05-initial-roles.md`
- `docs/13-system-flow-diagram.md` (Etapa 0)

---

### Etapa 3.3: Etapa 1 — Réguas e Match

**Objetivo**: UI para configuração das 5 réguas cognitivas e visualização do match.

#### Tarefas:

1. **Componente de Régua (Slider)**
   - Slider customizado 1-5 (para inference, scope, source, meta)
   - Slider customizado 1-3 (para decision, com cap visual)
   - Labels dinâmicos baseados no valor selecionado
   - Tooltip explicativo para cada posição
   - Estilização com Tailwind:
     - Track: `w-full h-2 bg-slate-200 rounded-full`
     - Thumb: `w-6 h-6 bg-primary rounded-full shadow-md`
     - Labels: `text-xs text-slate-500 mt-2`
     - Active state: `bg-primary` vs `bg-slate-300`

2. **Painel de Réguas**
   - Layout: lista vertical ou grid 2x3
   - Cada régua com:
     - Label
     - Slider
     - Valor atual + descrição
     - Ícone de ajuda

3. **Botão de Calcular Match**
   - POST para `/api/v1/contracts/:id/match`
   - Loading state
   - Exibição de resultados

4. **Visualização de Match**
   - Container: `space-y-4` para lista de candidatos
   - Se match forte (>= 90): exibir nível único destacado com `bg-green-50 border-green-200`
   - Se match ambíguo: exibir 2-3 candidatos com scores em `grid gap-4`
   - Card para cada nível candidato usando Tailwind:
     - Container: `bg-white rounded-lg shadow-sm border border-slate-200 p-6`
     - Nome completo (N1-N8): `text-xl font-bold text-slate-900`
     - Score percentual: `text-2xl font-mono text-primary`
     - Vetor de réguas: `grid grid-cols-5 gap-2 mt-4`
     - Badge: "Recomendado" `bg-green-100 text-green-800`, "Alternativa" `bg-yellow-100 text-yellow-800`, "Incompatível" `bg-red-100 text-red-800`
     - Badge styles: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`

5. **Hard Blocks UI**
   - Alert container: `bg-red-50 border border-red-200 rounded-lg p-4`
   - Ícone: `w-5 h-5 text-red-400`
   - Título: `text-sm font-medium text-red-800`
   - Descrição: `text-sm text-red-700 mt-1`
   - Ação sugerida: `text-sm text-red-600 underline`

6. **Correções Locais**
   - Se houver sugestões: exibir opções
   - Botões: "Aplicar correção A", "Aplicar correção B", "Manter como está"
   - Ao aplicar: POST para `/api/v1/contracts/:id/apply-correction`
   - Atualização do match

7. **Confirmação**
   - Resumo final do contrato
   - Confirmação de nível, réguas, hard blocks
   - Botão "Confirmar Contrato"
   - POST para `/api/v1/contracts/:id/confirm`

**Referências**:
- `docs/06-axes-and-rulers.md` (5 réguas)
- `docs/07-level-matching.md` (match, thresholds, correções)
- `docs/12-constitution.md` (cap de decisão)

---

### Etapa 3.4: Etapa 2 — Protocolo de Coleta

**Objetivo**: UI para execução do protocolo de coleta de critérios.

#### Tarefas:

1. **Tela de Introdução**
   - Container: `max-w-3xl mx-auto py-8 px-4`
   - Título: `text-2xl font-bold text-slate-900`
   - **Destaque visual**: `bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r`
   - Texto de alerta: "NÃO executaremos a tarefa agora" com `text-amber-800 font-medium`
   - Critérios implícitos: `grid gap-2` com badges `bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm`

2. **Componente de Bloco de Coleta**
   - Card: `bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden`
   - Header: `bg-slate-50 px-6 py-4 border-b border-slate-200`
   - Título: `text-lg font-semibold text-slate-900`
   - Instrução: `text-slate-600 leading-relaxed`
   - Lista "Incluir": `space-y-2` com ícones `text-green-500`
   - Lista "Evitar": `space-y-2` com ícones `text-red-500`
   - Exemplo: `bg-slate-50 p-4 rounded-md text-sm text-slate-600 italic`
   - Textarea: `w-full min-h-[120px] p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent`
   - Rationale: `text-xs text-slate-500 mt-2`

3. **Wizard de Coleta**
   - Progresso visual (stepper): `flex items-center space-x-2`
   - Step ativo: `w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium`
   - Step inativo: `w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm`
   - Conector: `flex-1 h-0.5 bg-slate-200`
   - Botões:
     - "Anterior": `px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50`
     - "Próximo": `px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90`
     - "Pular": `text-slate-500 hover:text-slate-700 underline`
   - Auto-save indicator: `text-xs text-green-600 flex items-center gap-1`

4. **Validação de Blocos**
   - Validação em tempo real
   - Indicador de campos obrigatórios
   - Bloqueio de avanço se inválido

5. **Revisão**
   - Container: `max-w-3xl mx-auto py-8 px-4`
   - Título: `text-2xl font-bold text-slate-900 mb-6`
   - Lista de critérios: `space-y-4`
   - Item revisão: `bg-slate-50 rounded-lg p-4 border border-slate-200`
   - Label: `text-sm font-medium text-slate-700`
   - Resposta: `text-slate-900 mt-1`
   - Botão editar: `text-sm text-primary hover:underline`

6. **Completude**
   - Botão "Finalizar Coleta": `w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90`
   - Tela de sucesso:
     - Container: `text-center py-12`
     - Ícone sucesso: `w-16 h-16 mx-auto text-green-500 mb-4`
     - Título: `text-2xl font-bold text-slate-900`
     - Resumo em cards: `grid gap-4 mt-8`
     - Botão copiar: `flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-md hover:bg-slate-200`

**Referências**:
- `docs/08-criteria-and-collection-protocol.md`
- `docs/04-process-phases.md` (proibição central)

---

### Etapa 3.5: Dashboard e Histórico

**Objetivo**: Visualização de sessões anteriores e analytics.

#### Tarefas:

1. **Lista de Sessões**
   - Grid/lista de sessões do usuário
   - Filtros: por papel, por nível, por data
   - Busca por texto

2. **Visualização de Sessão**
   - Detalhes completos do contrato
   - Protocolo de coleta completo
   - Payload coletado
   - Exportação (JSON, Markdown)

3. **Templates**
   - Salvar sessão como template
   - Reutilizar configurações

4. **Analytics (futuro)**
   - Distribuição de papéis mais usados
   - Níveis mais comuns
   - Tempo médio por etapa

---

## FASE 4: Integração e Deploy

### Etapa 4.1: Containerização

**Objetivo**: Dockerizar todos os serviços.

#### Tarefas:

1. **Dockerfile API (opcional - se usar Opção B)** (`infra/docker/api.Dockerfile`)
   - Multi-stage build
   - Node.js 20+ slim
   - **Nota**: Se usar Opção A (API embutida), não necessário

2. **Dockerfile Web (opcional - para desenvolvimento local)** (`infra/docker/web.Dockerfile`)
   - Multi-stage build (desenvolvimento local apenas)
   - React Router v7 SSR output (via `entry.server.tsx`)
   - **Nota**: Deploy em produção usa Cloudflare Workers (não Docker)

3. **Docker Compose Local (Desenvolvimento)**
   - Serviços: postgres (se desenvolvendo localmente sem Cloudflare), redis (opcional)
   - **Nota**: Com Cloudflare, usar `wrangler dev` (simula Workers localmente)
   - Hot reload via Wrangler
   - D1 local para testes: `wrangler d1 execute --local`

4. **Health Checks**
   - Endpoint `/health` em todos os serviços
   - Verificações de dependências (DB, cache)

---

### Etapa 4.2: Infraestrutura Cloud (Cloudflare Workers)

**Objetivo**: Configurar deploy serverless na edge usando Cloudflare Workers.

#### Tarefas:

1. **Setup Cloudflare Workers** (`workers/`)
   - Instalar `wrangler` como dependência de desenvolvimento
   - Configurar `wrangler.toml`:
     ```toml
     name = "human-ai-cognitive-interface"
     compatibility_date = "2024-01-01"
     compatibility_flags = ["nodejs_compat"]

     [build]
     command = "pnpm run build"

     [[envs.production]]
     name = "human-ai-cognitive-interface-prod"
     route = { pattern = "app.haci.dev/*", custom_domain = true }

     [[envs.staging]]
     name = "human-ai-cognitive-interface-staging"
     route = { pattern = "staging.haci.dev/*", custom_domain = true }
     ```

2. **Adaptação do React Router v7 para Workers**
   - Configurar handler do Workers em `app/entry.worker.ts`:
     ```typescript
     import { createRequestHandler } from "@react-router/cloudflare";
     import * as build from "./build/server";

     export default createRequestHandler({
       build,
       mode: process.env.NODE_ENV,
     });
     ```
   - Build otimizado para Workers (`vite.config.ts` com plugin `@react-router/cloudflare`)

3. **Banco de Dados (Cloudflare D1 + Cache)**
   - **D1**: Banco SQLite serverless para persistência
     - Criar schema SQL para D1 (adaptado do PostgreSQL)
     - Migrations via Wrangler
     - Comandos: `wrangler d1 create`, `wrangler d1 migrations apply`
   - **Cache API**: Para sessões e dados temporários (substitui Redis)
   - **KV**: Para configurações canônicas e templates (cache edge)

4. **Configuração de Domínio**
   - Registrar domínio `haci.dev` (ou outro)
   - Configurar DNS no Cloudflare
   - SSL/TLS automático (Cloudflare gerencia)
   - Configurar subdomínios:
     - `app.haci.dev` - Produção
     - `staging.haci.dev` - Staging

5. **Secrets Management**
   - Cloudflare Secrets via Wrangler:
     ```bash
     wrangler secret put API_KEY
     wrangler secret put DATABASE_URL
     ```
   - Variáveis de ambiente no `wrangler.toml` (não sensíveis)

6. **Edge Features (Opcional)**
   - **Cloudflare Pages**: Para assets estáticos (se necessário)
   - **Cloudflare Images**: Para otimização de imagens
   - **Rate Limiting**: Configurado no Cloudflare (nível edge)

**Vantagens da Arquitetura Cloudflare**:
- Deploy global em 300+ edge locations
- Cold start zero ( Workers isolam V8 isolates)
- D1 (SQLite) com replicação automática
- Sem necessidade de Kubernetes ou Terraform
- Custo escalável (pay-per-request)

---

### Etapa 4.3: CI/CD

**Objetivo**: Automatizar deploy.

#### Tarefas:

1. **GitHub Actions**
   - `.github/workflows/ci.yml`: lint, test, build
   - `.github/workflows/deploy-staging.yml`: deploy para staging
   - `.github/workflows/deploy-prod.yml`: deploy para produção

2. **Pipeline de CI**
   - Instalar dependências (pnpm)
   - Executar lint (Biome)
   - Executar testes unitários (Vitest)
   - Executar testes de integração
   - Build da aplicação
   - Verificação de tipos (tsc)

3. **Pipeline de CD (Cloudflare Workers)**
   - **Deploy Staging**:
     ```yaml
     - name: Deploy to Cloudflare Workers (Staging)
       run: wrangler deploy --env staging
       env:
         CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
         CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
     ```
   - **Deploy Production**:
     ```yaml
     - name: Deploy to Cloudflare Workers (Production)
       run: wrangler deploy --env production
       env:
         CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
         CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
     ```
   - **Migrations D1**:
     ```yaml
     - name: Apply D1 Migrations
       run: wrangler d1 migrations apply human-ai-cognitive-interface-db --env production
     ```
   - **Smoke Tests pós-deploy**:
     - Verificar se `/health` responde
     - Verificar se rotas principais funcionam

4. **Versionamento**
   - Semantic versioning
   - Git tags para releases
   - Changelog automático
   - Cloudflare Workers rollback via `wrangler rollback`

---

### Etapa 4.4: Monitoramento e Observabilidade

**Objetivo**: Sistema de monitoramento completo.

#### Tarefas:

1. **Logging**
   - Estruturado (JSON)
   - **Cloudflare Workers Logs**: Via `wrangler tail` e dashboard
   - **Cloudflare Logpush**: Para SIEM externo (opcional)
   - Níveis: DEBUG, INFO, WARN, ERROR
   - Logs em tempo real no desenvolvimento

2. **Métricas (Cloudflare Analytics)**
   - **Cloudflare Analytics** (incluído na plataforma):
     - Requests por minuto
     - Latência p50/p99
     - Taxa de erro
     - Cache hit ratio
   - **Workers Analytics**:
     - Invocações por minuto
     - CPU time
     - Memory usage
   - Métricas customizadas via Cloudflare Analytics Engine (se necessário)

3. **Tracing**
   - **Cloudflare Trace**: Distributed tracing nativo
   - **OpenTelemetry**: Opcional, via Workers
   - Trace ID em logs para correlacionar requests

4. **Alertas (Cloudflare Notifications)**
   - Configurar notificações no dashboard Cloudflare:
     - Error rate > 1%
     - Latência elevada
     - Workers CPU quota approaching
   - Integrações: Email, Slack, PagerDuty

5. **Status Page**
   - Cloudflare Status Page ou Statuspage.io
   - Monitoramento de uptime via Cloudflare Load Balancing health checks
   - Transparência com usuários

---

### Etapa 4.5: Segurança

**Objetivo**: Garantir segurança do sistema.

#### Tarefas:

1. **Segurança da API**
   - Rate limiting no edge (Cloudflare Rate Limiting)
   - WAF (Web Application Firewall) da Cloudflare
   - CORS configurado
   - Validação de input (Zod)
   - Bot Management (Cloudflare)

2. **Segurança de Dados**
   - D1: Encryption at rest (automático)
   - Encryption in transit (TLS 1.3 automático via Cloudflare)
   - Hash de dados sensíveis
   - Política de retenção

3. **Compliance (Cloudflare)**
   - GDPR compliance (Cloudflare é GDPR compliant)
   - Auditoria de acessos via Cloudflare Logs
   - Logs imutáveis
   - Data residency (opções de região no D1)

4. **Vulnerabilidades**
   - Snyk/Dependabot para dependências
   - Scans regulares
   - Security headers via Cloudflare (HSTS, CSP, etc.)

---

## FASE 5: Evolução e Extensões

### Etapa 5.1: Raycast Extension (Migração)

**Objetivo**: Migrar extensão existente para usar API.

#### Tarefas:

1. **Refatoração**
   - Mover lógica para chamadas à API
   - Manter UI existente como cliente
   - Cache local para config canônica

2. **Funcionalidades**
   - Listar sessões recentes
   - Criar nova sessão
   - Visualizar contrato
   - Exportar resultado

3. **Publicação**
   - Raycast Store
   - Documentação específica

**Referências**:
- Código atual: `src/canonical-prompt-generator.tsx`

---

### Etapa 5.2: Mobile App (Futuro)

**Objetivo**: Aplicativo React Native.

#### Tarefas:

1. **Setup React Native**
   - Expo ou bare workflow
   - TypeScript

2. **Interface Mobile**
   - Adaptação das telas web
   - Touch-optimized
   - Offline support (SQLite)

3. **Features**
   - Sincronização com cloud
   - Notificações push
   - Widgets (iOS/Android)

---

### Etapa 5.3: CLI

**Objetivo**: Interface de linha de comando.

#### Tarefas:

1. **Setup oclif or commander.js**
   - `haci init` - criar sessão
   - `haci contract` - configurar contrato
   - `haci collect` - executar coleta
   - `haci export` - exportar resultado

2. **Integração**
   - Chamadas à API
   - Config file (`~/.haci/config.json`)
   - API key management

---

### Etapa 5.4: Integrações

**Objetivo**: Conectar com outros sistemas.

#### Tarefas:

1. **Slack App**
   - Bot para criar sessões
   - Notificações de completude

2. **Notion Integration**
   - Exportar contratos para Notion
   - Templates de documentação

3. **GitHub Integration**
   - Criar issues a partir de sessões
   - Templates de PR

4. **Webhooks**
   - Notificar sistemas externos
   - Eventos: session.created, contract.confirmed, collection.completed

---

## FASE 6: Testes e Qualidade

### Etapa 6.1: Testes Unitários

**Objetivo**: Cobertura > 80% em `core/`.

#### Tarefas:

1. **Setup Vitest**
   - Configuração para TypeScript
   - Coverage com v8

2. **Testes do Motor de Match**
   - Testar cada função pura
   - Casos de borda
   - Property-based testing (fast-check)

3. **Testes de Derivação**
   - Cada regra R0-R8
   - Combinações de papel + réguas

4. **Mocks**
   - Mock de configs JSON
   - Snapshot testing para prompts

---

### Etapa 6.2: Testes de Integração

**Objetivo**: Testar fluxos completos.

#### Tarefas:

1. **Setup**
   - SQLite em memória para testes (simula D1)
   - Vitest para testes de integração
   - Testar actions diretamente (sem HTTP)

2. **Fluxos Testados**
   - Criação de sessão → match → correção → confirmação
   - Derivação de critérios → coleta → completude
   - Hard blocks e validações

3. **CI**
   - Executar em cada PR
   - Block merge se falhar

---

### Etapa 6.3: Testes E2E

**Objetivo**: Testar aplicação web end-to-end.

#### Tarefas:

1. **Setup Playwright**
   - Configuração para React Router v7 Framework
   - Mobile emulation

2. **Cenários**
   - Happy path completo
   - Hard blocks e correções
   - Validações de formulário
   - Responsividade

3. **Visual Regression**
   - Screenshots de referência
   - Comparação em CI

---

## FASE 7: Documentação e Lançamento

### Etapa 7.1: Documentação Técnica

**Objetivo**: Documentação completa para desenvolvedores.

#### Tarefas:

1. **READMEs**
   - Raiz do projeto
   - `/docs` para documentação técnica

2. **API Documentation**
   - OpenAPI/Swagger
   - Exemplos de requisições
   - Postman collection

3. **Architecture Decision Records (ADR)**
   - `docs/adr/`
   - Decisões técnicas documentadas

4. **Developer Guide**
   - Como rodar local
   - Como contribuir
   - Convenções de código

---

### Etapa 7.2: Documentação de Usuário

**Objetivo**: Guias para usuários finais.

#### Tarefas:

1. **User Guide**
   - Conceitos (papéis, réguas, níveis)
   - Walkthrough do sistema
   - Exemplos de uso

2. **Video Tutorials**
   - Screencasts
   - Tutoriais passo a passo

3. **FAQ**
   - Perguntas comuns
   - Troubleshooting

4. **Changelog**
   - Mudanças por versão
   - Breaking changes

---

### Etapa 7.3: Lançamento

**Objetivo**: Go-live do sistema.

#### Tarefas:

1. **Soft Launch (Beta)**
   - Convite para beta testers
   - Coleta de feedback
   - Iteração rápida

2. **Public Launch**
   - Post de blog
   - Social media
   - Product Hunt

3. **Suporte**
   - Canal de suporte (Discord/Slack)
   - Documentação de troubleshooting
   - SLA de resposta

---

## Apêndice A: Checklist de Implementação

### Por Fase:

**FASE 0**:
- [ ] Estrutura de diretórios criada
- [ ] Tooling configurado (pnpm, Biome, Tailwind 4.x)
- [ ] Tipos TypeScript implementados
- [ ] JSONs canônicos criados

**FASE 1**:
- [ ] Motor de match implementado
- [ ] Motor de derivação implementado
- [ ] Templates de prompt criados
- [ ] Testes unitários passando

**FASE 2**:
- [ ] API estruturada (actions/loaders do RR)
- [ ] Actions de contrato funcionando
- [ ] Actions de coleta funcionando
- [ ] Validações implementadas

**FASE 3**:
- [ ] Web app com React Router v7 Framework
- [ ] Etapa 0 (papel) implementada
- [ ] Etapa 1 (match) implementada
- [ ] Etapa 2 (coleta) implementada
- [ ] Dashboard funcionando
- [ ] Testes E2E passando

**FASE 4**:
- [ ] Cloudflare Workers configurado
- [ ] D1 database criado e migrado
- [ ] CI/CD funcionando (deploy via Wrangler)
- [ ] Monitoramento configurado (Cloudflare Analytics)
- [ ] Deploy em staging (workers + D1)
- [ ] Deploy em produção (workers + D1)

**FASE 5-7**:
- [ ] Raycast extension migrada
- [ ] Documentação completa
- [ ] Lançamento realizado

---

## Apêndice B: Referências Cruzadas

| Implementação | Documentação Canônica |
|--------------|----------------------|
| Tipos/Rulers | `docs/06-axes-and-rulers.md` |
| Tipos/Levels | `docs/07-level-matching.md` |
| Motor/Match | `docs/07-level-matching.md` |
| Motor/Derivação | `docs/08-criteria-and-collection-protocol.md` |
| Actions/Modos | `docs/04-process-phases.md` |
| Validações | `docs/12-constitution.md` |
| Papéis | `docs/05-initial-roles.md` |
| Fluxo geral | `docs/13-system-flow-diagram.md` |

---

## Apêndice C: Glossário de Termos

- **Contrato Cognitivo**: Configuração normativa que define como a IA deve agir
- **Régua Cognitiva**: Eixo de controle exposto ao usuário (5 no sistema)
- **Nível Canônico**: Preset de comportamento (N1-N8)
- **Hard Block**: Bloqueio semântico que previne execução
- **Modo de Operação**: Estado do sistema (PREPARATION, GOVERNANCE, EXECUTION)
- **Protocolo de Coleta**: Conjunto ordenado de blocos de perguntas
- **Critério**: Necessidade semântica a ser satisfeita

---

**Próximos Passos Imediatos**:
1. Revisar este roadmap com stakeholders
2. Priorizar fases (MVP = Fases 0-4)
3. Criar tickets/issues para cada etapa
4. Estimar esforço por etapa
5. Definir milestones e datas
