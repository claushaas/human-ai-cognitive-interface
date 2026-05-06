<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 23 — Estratégia de Testes

## 1. Decisão canônica

O projeto deve ser robusto desde o começo.

Frameworks:

- Vitest para unit/integration;
- Playwright para E2E;
- LLM mockado no CI.

O core determinístico deve ter alta cobertura.

## 2. Objetivos

A estratégia de testes deve proteger:

1. fidelidade conceitual;
2. engine determinística;
3. regras constitucionais;
4. schemas Zod;
5. geração de contrato;
6. integração com D1;
7. actions/loaders;
8. geração de prompt com LLM mockado;
9. fluxo principal do usuário.

## 3. Filosofia

O HACI depende de regras cognitivas. Portanto, os testes não devem validar apenas UI ou endpoints. Eles devem impedir regressões no comportamento do sistema.

Prioridade:

1. core determinístico;
2. contratos;
3. persistência;
4. runtime;
5. UI;
6. E2E.

## 4. Tipos de teste

| Tipo | Ferramenta | CI |
|---|---|---|
| Unit | Vitest | sim |
| Integration | Vitest | sim |
| Worker/runtime | Vitest + ambiente Cloudflare/Miniflare equivalente | sim |
| E2E | Playwright | sim, após estabilização |
| LLM real | manual/local | não |
| Evals qualitativos | manual | não obrigatório |

## 5. Unit tests

### Core determinístico

Testar:

- `computeWeightedDistance`;
- `distanceToScore`;
- `evaluateHardBlocks`;
- `matchLevels`;
- `generateLocalDeltas`;
- `applyDelta`;
- thresholds;
- role prior;
- correções seguras;
- cap constitucional de decisão.

### Casos obrigatórios

1. `decision > 3` bloqueia.
2. Nível com `decision > 3` nunca é candidato.
3. Fonte fechada + pesquisa bloqueia.
4. Inferência alta + fonte fechada bloqueia.
5. Escopo sistêmico sem intenção sistêmica bloqueia.
6. N6 exige decisão 3.
7. Match forte auto-seleciona.
8. Match ambíguo retorna candidatos.
9. Match fraco bloqueia.
10. Correção local nunca altera mais de 2 réguas.
11. Correção local nunca altera mais de ±1.
12. Correção local não introduz novo bloqueio.

## 6. Schema tests

Validar schemas Zod para:

- `RawIntent`;
- `InitialRole`;
- `RulersVector`;
- `LevelMatch`;
- `CognitiveContract`;
- `CollectionProtocol`;
- `CollectionAnswer`;
- `PromptGenerationRequest`;
- `PromptGenerationResult`;
- `Session`;
- `Feedback`.

Casos:

- dados válidos passam;
- campos obrigatórios ausentes falham;
- enums inválidos falham;
- `decision=4` falha;
- locale inválido falha;
- JSON de LLM inválido falha.

## 7. Golden tests

Usar fixtures JSON legíveis.

Estrutura:

```text
tests/fixtures/
  match/
    n1-execucao-delimitada.json
    n5-apoio-decisao.json
    blocked-decision-high.json
    ambiguous-n4-n5.json
  contracts/
    valid-contract-v1.json
    invalid-contract-decision-4.json
  llm/
    valid-prompt-result.json
    invalid-json-result.json
```

Golden tests devem validar outputs esperados de match e contrato.

## 8. Integration tests

Testar:

- action de criação de sessão;
- action de atualização de ajustes;
- action de geração;
- persistência em D1;
- rate limit;
- feedback;
- exportação;
- autenticação mockada via Cloudflare Access headers.

## 9. Worker tests

Usar ambiente compatível com Cloudflare Workers.

Objetivos:

- garantir que loaders/actions funcionam no runtime;
- garantir que bindings são resolvidos;
- garantir que D1 é acessível;
- garantir que secrets/config são lidos corretamente;
- garantir que APIs Node incompatíveis não vazam para runtime.

## 10. LLM mockado

CI deve mockar a LLM.

Mocks obrigatórios:

1. sucesso com prompt válido;
2. JSON inválido;
3. timeout;
4. erro de provider;
5. rate limit externo;
6. resposta vazia;
7. resposta longa demais.

A interface `LlmClient` deve permitir injeção de mock.

## 11. Testes com LLM real

Não rodam no CI.

Podem existir scripts manuais:

```bash
pnpm test:llm:manual
```

Esses testes exigem:

- `DEEPSEEK_API_KEY`;
- confirmação explícita;
- baixo volume.

## 12. E2E com Playwright

Fluxo principal mínimo:

1. usuário autenticado abre app;
2. insere intenção inicial;
3. escolhe papel inicial;
4. ajusta controles;
5. sistema calcula profundidade;
6. usuário responde detalhes;
7. revisa;
8. gera prompt;
9. copia prompt;
10. registra feedback positivo.

Fluxos adicionais:

- bloqueio por decisão alta;
- limite diário atingido;
- erro de LLM;
- histórico;
- exportação;
- mobile viewport.

## 13. E2E no CI

Rodar E2E no CI após estabilização do MVP.

Antes disso:

- manter Playwright configurado;
- rodar localmente/manual;
- não bloquear deploy inicial se ainda instável.

Depois da estabilização:

- fluxo principal deve bloquear merge;
- fluxos secundários podem rodar em nightly/manual.

## 14. Cobertura

Meta recomendada:

| Área | Meta |
|---|---|
| Engine determinística | alta, idealmente 90%+ |
| Schemas | alta |
| Server/actions | média/alta |
| UI components | pragmática |
| E2E | fluxo principal |

Não perseguir cobertura numérica global se isso gerar testes frágeis. Priorizar cobertura semântica.

## 15. Testes de acessibilidade

MVP deve incluir verificações básicas:

- labels;
- foco;
- contraste manual;
- navegação básica por teclado;
- mensagens de erro associadas.

Pode usar testes automatizados com axe futuramente, mas não é obrigatório no primeiro corte.

## 16. Testes de i18n

Validar:

- pt-BR renderiza corretamente;
- en renderiza corretamente;
- locale inválido cai para default;
- prompt final respeita idioma alvo.

## 17. Testes de segurança

Casos mínimos:

- input tentando mandar a LLM ignorar instruções;
- input pedindo execução externa;
- input tentando exceder decisão constitucional;
- input vazio;
- input muito longo;
- usuário não autenticado;
- usuário excedendo limite diário.

## 18. Testes de exportação

Validar:

- export Markdown;
- export JSON debug, se implementado;
- sessão deletada não exporta;
- usuário não pode exportar sessão de outro usuário.

## 19. Testes de persistência

Validar:

- cria usuário;
- cria sessão;
- atualiza sessão;
- salva prompt;
- salva feedback;
- soft delete;
- histórico ignora deletados;
- rate limit incrementa corretamente.

## 20. Comandos recomendados

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "biome:check": "biome check .",
    "biome:fix": "biome check --write .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:llm:manual": "tsx scripts/test-llm-manual.ts",
    "build": "react-router build"
  }
}
```

## 21. Não objetivos

- Testar LLM real no CI.
- Snapshot frágil de UI inteira.
- Cobertura 100% artificial.
- Evals automáticos complexos no MVP.
- Testes dependentes de ordem temporal real sem controle.
