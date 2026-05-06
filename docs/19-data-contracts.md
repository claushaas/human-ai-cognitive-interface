<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 19 — Contratos de Dados

## 1. Decisão canônica

A fonte de verdade dos contratos de domínio será **Zod**.

A documentação deve apresentar os contratos conceituais e exemplos JSON completos, mas a implementação deve derivar tipos TypeScript a partir dos schemas Zod.

Versão inicial dos contratos: **v1**.

## 2. Princípios

1. Contratos devem ser explícitos.
2. Validação acontece no Worker.
3. Core determinístico recebe estruturas já validadas.
4. Dados persistidos devem manter versão.
5. Outputs de LLM nunca são confiáveis sem validação.
6. Contratos internos podem aparecer no modo debug, mas não na UI principal.

## 3. Entidades canônicas

Entidades principais:

- `RawIntent`
- `InitialRole`
- `RulersVector`
- `LevelCandidate`
- `LevelMatch`
- `HardBlock`
- `CorrectionSuggestion`
- `CognitiveContract`
- `CollectionProtocol`
- `CollectionQuestion`
- `CollectionAnswer`
- `PromptGenerationRequest`
- `PromptGenerationResult`
- `Session`
- `Feedback`

## 4. Tipos base

### Scale1to5

```ts
type Scale1to5 = 1 | 2 | 3 | 4 | 5;
```

### Locale

```ts
type Locale = "pt-BR" | "en";
```

### ContractVersion

```ts
type ContractVersion = "v1";
```

## 5. RawIntent

Representa a entrada inicial do usuário.

```json
{
  "version": "v1",
  "locale": "pt-BR",
  "text": "Quero criar um prompt para pedir ajuda na arquitetura de um app financeiro.",
  "desiredOutcome": "Obter uma resposta técnica clara com opções e trade-offs"
}
```

Campos:

| Campo | Tipo | Obrigatório |
|---|---|---|
| `version` | `"v1"` | sim |
| `locale` | `"pt-BR" \| "en"` | sim |
| `text` | string | sim |
| `desiredOutcome` | string | recomendado |

## 6. InitialRole

Papéis canônicos:

| ID | Nome público |
|---|---|
| `role.analyze` | Analisar |
| `role.synthesize` | Organizar / Sintetizar |
| `role.explore` | Explorar alternativas |
| `role.decideSupport` | Apoiar decisão |
| `role.document` | Documentar / Formalizar |
| `role.transform` | Transformar conteúdo |

Exemplo:

```json
{
  "id": "role.explore",
  "label": "Explorar alternativas"
}
```

## 7. RulersVector

As cinco réguas cognitivas canônicas:

```ts
type RulersVector = {
  inference: Scale1to5;
  decision: Scale1to5;
  scope: Scale1to5;
  source: Scale1to5;
  meta: Scale1to5;
};
```

Exemplo:

```json
{
  "inference": 3,
  "decision": 2,
  "scope": 3,
  "source": 1,
  "meta": 4
}
```

### Regra constitucional

`decision` não pode exceder `3`.

Valores `4` e `5` são proibidos por design.

## 8. RulerValueDetail

Quando for necessário registrar origem/confiança:

```json
{
  "value": 3,
  "source": "user",
  "confidence": 1,
  "rationale": "Usuário ajustou manualmente."
}
```

Fontes possíveis:

- `user`
- `inferred`
- `corrected`
- `default`

## 9. Níveis canônicos

IDs:

- `N1`
- `N2`
- `N3`
- `N4`
- `N5`
- `N6`
- `N7`
- `N8`

Tabela:

| ID | Nome |
|---|---|
| `N1` | Execução Estritamente Delimitada |
| `N2` | Análise Controlada e Diagnóstico |
| `N3` | Síntese Estruturada e Organização Cognitiva |
| `N4` | Exploração de Alternativas e Trade-offs |
| `N5` | Apoio à Decisão Humana |
| `N6` | Governança, Controle e Segurança Cognitiva |
| `N7` | Meta-Cognição e Arquitetura de Pensamento |
| `N8` | Documentação, Contratos e Sistemas de Uso |

## 10. LevelCandidate

```json
{
  "levelId": "N5",
  "name": "Apoio à Decisão Humana",
  "score": 87.5,
  "distance": 1.4,
  "reasons": ["Compatível com exploração e recomendação leve."]
}
```

## 11. LevelMatch

```json
{
  "selectedLevel": null,
  "score": null,
  "candidates": [
    {
      "levelId": "N4",
      "name": "Exploração de Alternativas e Trade-offs",
      "score": 88.2,
      "distance": 1.1,
      "reasons": []
    },
    {
      "levelId": "N5",
      "name": "Apoio à Decisão Humana",
      "score": 84.7,
      "distance": 1.5,
      "reasons": []
    }
  ],
  "blocked": {
    "isBlocked": false,
    "reasons": []
  },
  "correctionsSuggested": [
    {
      "id": "corr-1",
      "label": "decision +1",
      "delta": {
        "decision": 1
      },
      "shortRationale": "Ajuste local para reduzir ambiguidade."
    }
  ]
}
```

Regras:

- match forte pode preencher `selectedLevel`;
- match ambíguo retorna candidatos;
- bloqueio retorna `blocked.isBlocked = true`;
- correções são opcionais e limitadas.

## 12. HardBlock

```json
{
  "id": "block.decision.totalOrHigh",
  "severity": "blocking",
  "message": "Decisão alta é proibida por design.",
  "rulers": ["decision"]
}
```

Severidades:

- `blocking`
- `requires_confirmation`
- `warning`

## 13. CorrectionSuggestion

```json
{
  "id": "corr-1",
  "label": "Reduzir inferência",
  "delta": {
    "inference": -1
  },
  "shortRationale": "Reduz suposição quando a fonte está fechada."
}
```

Regras:

- máximo de 3 sugestões;
- máximo de 2 réguas alteradas;
- máximo ±1 por régua;
- nunca introduzir novo bloqueio.

## 14. CognitiveContract

Contrato interno da sessão.

```json
{
  "version": "v1",
  "contractId": "contract_01",
  "sessionId": "session_01",
  "locale": "pt-BR",
  "rawIntent": {
    "version": "v1",
    "locale": "pt-BR",
    "text": "Quero criar um prompt para planejar uma arquitetura com Cloudflare Workers.",
    "desiredOutcome": "Receber um prompt técnico claro para iniciar uma conversa com IA."
  },
  "initialRole": {
    "id": "role.document",
    "label": "Documentar / Formalizar"
  },
  "rulers": {
    "inference": 3,
    "decision": 2,
    "scope": 4,
    "source": 1,
    "meta": 5
  },
  "levelMatch": {
    "selectedLevel": "N8",
    "score": 92.4,
    "candidates": [],
    "blocked": {
      "isBlocked": false,
      "reasons": []
    },
    "correctionsSuggested": []
  },
  "constraints": {
    "outputLanguage": "pt-BR",
    "outputFormat": "prompt",
    "mustNotExecuteFinalTask": true
  },
  "createdAt": "2026-05-05T00:00:00.000Z"
}
```

O contrato deve ser versionado. Refinamentos futuros devem criar nova versão ou novo contrato associado à mesma sessão.

## 15. CollectionProtocol

Define perguntas necessárias antes da geração.

```json
{
  "version": "v1",
  "contractId": "contract_01",
  "questions": [
    {
      "id": "q_goal",
      "label": "Qual resultado final você quer obter?",
      "description": "Descreva o que a IA de destino deve entregar.",
      "required": true,
      "answerType": "long_text",
      "examples": ["Uma especificação técnica", "Um plano de ação", "Uma revisão crítica"],
      "validation": {
        "minLength": 20,
        "maxLength": 2000
      }
    }
  ]
}
```

Tipos de resposta:

- `short_text`
- `long_text`
- `number`
- `boolean`
- `single_select`
- `multi_select`

## 16. CollectionAnswer

```json
{
  "questionId": "q_goal",
  "value": "Quero uma especificação técnica para implementar SSR com React Router 7 em Cloudflare Workers.",
  "answeredAt": "2026-05-05T00:00:00.000Z"
}
```

## 17. PromptGenerationRequest

```json
{
  "version": "v1",
  "sessionId": "session_01",
  "contractId": "contract_01",
  "contract": {},
  "answers": [],
  "targetLocale": "pt-BR"
}
```

Na implementação real, `contract` e `answers` devem usar os schemas correspondentes.

## 18. PromptGenerationResult

```json
{
  "version": "v1",
  "sessionId": "session_01",
  "contractId": "contract_01",
  "model": "DeepSeek-V4-Flash",
  "prompt": "Você é um arquiteto técnico...",
  "warnings": [],
  "usage": {
    "inputTokens": 1200,
    "outputTokens": 900,
    "cost": null
  },
  "createdAt": "2026-05-05T00:00:00.000Z"
}
```

## 19. Session

Uma sessão representa uma geração de prompt.

```json
{
  "id": "session_01",
  "userId": "user_01",
  "status": "completed",
  "locale": "pt-BR",
  "inputText": "Quero criar um prompt...",
  "prompt": "Você é...",
  "createdAt": "2026-05-05T00:00:00.000Z",
  "updatedAt": "2026-05-05T00:02:00.000Z",
  "deletedAt": null
}
```

Status:

- `draft`
- `collecting`
- `ready`
- `generating`
- `completed`
- `failed`
- `deleted`

## 20. Feedback

```json
{
  "sessionId": "session_01",
  "value": "positive",
  "createdAt": "2026-05-05T00:03:00.000Z"
}
```

Valores:

- `positive`
- `negative`

## 21. Separação Zod/Drizzle

Zod é a fonte de verdade dos contratos de domínio.

Drizzle é a fonte de verdade das tabelas de persistência.

Não tentar fazer o schema de banco representar integralmente todos os objetos aninhados do contrato. Campos JSON versionados são aceitáveis no MVP quando simplificam persistência.
