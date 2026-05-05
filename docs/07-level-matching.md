# Sistema Canônico de Match de Níveis Cognitivos

## 1) Finalidade

O sistema transforma a combinação:

- papel inicial (orientação de intenção),
- réguas cognitivas (posições 1–5),
em um **match** com níveis canônicos de comportamento.

Princípio registrado:

- o usuário **não escolhe diretamente um nível**;
- o sistema calcula match, aplica bloqueios, e retorna:
  - nível final (quando inequívoco), ou
  - conjunto reduzido (2–3) + correções locais (quando ambíguo), ou
  - bloqueio com pergunta mínima (quando incompatível).

Regra de precedência entre artefatos (JSON → código → Markdown): ver `12-constitution.md`.

## 2) Representação vetorial (base)

Representação registrada:

- usuário: vetor `U = (i, d, e, f, m)` (Inferência, Decisão, Escopo, Fonte, Meta)
- nível canônico: vetor `N_k`

## 3) Tabela canônica de níveis (N1–N8)

Tabela canônica (derivada do JSON canônico; consistente com a implementação):

| Nível | Nome | Vetor (inference, decision, scope, source, meta) |
| --- | --- | --- |
| N1 | Execução Estritamente Delimitada | (1, 1, 1, 1, 1) |
| N2 | Análise Controlada e Diagnóstico | (2, 1, 2, 1, 1) |
| N3 | Síntese Estruturada e Organização Cognitiva | (3, 1, 3, 1, 1) |
| N4 | Exploração de Alternativas e Trade-offs | (4, 1, 4, 2, 1) |
| N5 | Apoio à Decisão Humana | (4, 2, 4, 2, 2) |
| N6 | Governança, Controle e Segurança Cognitiva | (2, 3, 5, 1, 3) |
| N7 | Meta-Cognição e Arquitetura de Pensamento | (3, 1, 4, 2, 5) |
| N8 | Documentação, Contratos e Sistemas de Uso | (2, 2, 5, 1, 5) |

## 4) Distância e score (visão técnica)

O cálculo descrito/implementado usa:

- **distância Manhattan ponderada**: Σ (peso_eixo × |U_eixo − N_eixo|)
- score normalizado (0..100) por distância/máximo

Pesos canônicos aparecem em artefatos (`canonical-prompt-generator.json` / `canonical-match.ts`):

- inferência: 1.0
- decisão: 1.5
- escopo: 1.2
- fonte: 1.5
- meta: 1.3

## 5) Prior do papel inicial (viés suave)

Existe um prior opcional que:

- dá um “boost” de score para alguns níveis, condicionado ao papel inicial;
- contribui até um máximo configurado (ex.: 0.15).

Lista de boosts aparece em `info/canonical-prompt-generator.json` e `info/canonical-match.ts`.

## 6) Bloqueios semânticos (hard blocks)

Há a noção de bloqueios duros com precedência sobre score.

Decisão canônica:

- A lista canônica de hard blocks é a do JSON canônico (`matching.hardBlocks.rules`).
- O código deve refletir o JSON; divergências são bug (ver decisão consolidada em `09-open-issues-and-gaps.md`).

Lista canônica (ids do JSON):

1. `block.decision.totalOrHigh` — decisão ≥ 4 é proibida.
2. `block.source.closedButResearch` — fonte fechada (`source = 1`) bloqueia papéis que dependem de pesquisa/alternativas externas (ex.: `role.research` e `role.explore`).
3. `block.inferenceHighWithClosedSource` — inferência alta com fonte fechada é instável.
4. `block.metaHighAgainstOperational` — meta alta pode conflitar com objetivo operacional direto (exige confirmação).
5. `block.scopeSystemicWithoutSystemicIntent` — escopo sistêmico sem intenção sistêmica (user scope ≤ 2 vs nível scope ≥ 4).
6. `block.governanceRequiresDecision3` — N6 exige decisão = 3.

## 7) Thresholds e resultados

Thresholds canônicos aparecem em artefatos de configuração:

- `autoSelectMin`: 90
- `candidatesMin`: 70
- `blockBelow`: 70
- `maxCandidates`: 3

Comportamentos registrados:

- match forte: auto-seleção quando um nível é claramente dominante;
- match ambíguo: retorna candidatos e sugere correções;
- match fraco: bloqueia e solicita revisão (sem execução).

## 8) Correções locais (fallback controlado, sem loop)

Existe um mecanismo registrado para evitar loops e múltiplas chamadas:

- correções são deltas discretos;
- no máximo 2 réguas alteradas;
- magnitude máxima ±1 por régua;
- usuário escolhe uma correção (ou nenhuma);
- aplica uma vez e segue (sem novo ciclo de escolha).

Configurações e implementação aparecem em:

- `info/canonical-prompt-generator.json` (`matching.corrections`)
- `info/canonical-match.ts` (`suggestCorrectionsSafe`, `generateLocalDeltas`, `applyDelta`)

## 9) Separação entre níveis operacionais e meta/constitucionais

Definição normativa (ver `12-constitution.md`):

- N1–N6 são níveis operacionais.
- N7–N8 são níveis meta/constitucionais.

Regra normativa:

- N7 e N8 não devem competir com N1–N6 como alternativas no mesmo conjunto semântico apresentado ao usuário.
- Quando N7/N8 forem candidatos relevantes, a orquestração deve tratar isso como mudança de regime (meta/constitucional), não como “mais um nível operacional”.

Regra operacional (implementável) para apresentação:

- A orquestração deve aplicar a regra de seleção de track descrita em `12-constitution.md` (seção 5.1), garantindo que o usuário nunca veja níveis operacionais e meta/constitucionais competindo no mesmo conjunto de escolha.
