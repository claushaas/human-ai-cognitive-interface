<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 21 — Integração com LLM

## 1. Decisão canônica

Provider inicial: **DeepSeek**.

Modelo inicial: **DeepSeek-V4-Flash**.

O identificador operacional do modelo deve ser configurável por variável de ambiente:

```text
LLM_MODEL=deepseek-v4-flash
```

Se o modelo for acessado por gateway intermediário, como OpenRouter, o identificador pode variar. O produto, porém, deve tratar o modelo canônico como DeepSeek-V4-Flash.

## 2. Papel da LLM no HACI

A LLM não conversa livremente com o usuário no MVP.

Ela é usada internamente para auxiliar a geração do prompt final e, quando previsto pela documentação canônica, para etapas estruturadas de derivação.

O sistema deve preservar o princípio:

> O core determinístico decide estrutura, bloqueios e compatibilidade. A LLM compõe linguagem dentro de limites validados.

## 3. Pontos de uso

### Permitidos no MVP

- derivação de critérios quando necessário;
- composição do prompt final;
- reformulação linguística controlada do prompt;
- adaptação para português/inglês.

### Não permitidos no MVP

- decisão autônoma de nível;
- bypass de hard blocks;
- alteração não validada do contrato;
- execução final da tarefa do usuário;
- ações externas;
- conversa livre com o usuário.

## 4. Boundary

O client nunca chama a LLM diretamente.

Todas as chamadas passam por:

```text
React Router action -> Worker -> llm.server.ts -> DeepSeek
```

O Worker deve:

1. autenticar usuário;
2. aplicar rate limit;
3. validar contrato;
4. montar prompt interno;
5. chamar LLM;
6. validar output;
7. persistir resultado.

## 5. Structured output

Sempre que a LLM retornar dados estruturados, o output deve ser validado com Zod.

Estratégia:

- pedir JSON estrito quando necessário;
- validar com schema;
- rejeitar ou tentar um repair controlado se inválido;
- nunca aceitar output inválido silenciosamente.

## 6. Retries

Política MVP:

| Erro | Ação |
|---|---|
| Timeout | 1 retry |
| JSON inválido | 1 repair/retry |
| Rate limit provider | erro amigável |
| Auth/provider inválido | erro técnico |
| Safety/blocked | erro controlado |

Máximo recomendado: 2 tentativas totais por geração.

## 7. Temperatura

Configuração recomendada:

```text
temperature=0.3
```

Motivo:

- o output precisa ser útil e bem escrito;
- mas não excessivamente criativo;
- consistência é mais importante que variedade.

## 8. Prompt architecture

Separar prompts internos em arquivos versionados.

Estrutura sugerida:

```text
src/server/prompts/
  v1/
    derive-criteria.prompt.ts
    generate-final-prompt.prompt.ts
    repair-json.prompt.ts
```

Cada prompt deve ter:

- versão;
- objetivo;
- inputs esperados;
- output schema;
- regras de segurança;
- exemplos mínimos, se úteis.

## 9. Prompt final gerado

O prompt final deve ser um artefato para copiar.

Deve conter, quando adequado:

- papel da IA de destino;
- contexto;
- objetivo;
- critérios;
- restrições;
- nível de inferência permitido;
- grau de recomendação permitido;
- formato esperado da resposta;
- regras de pergunta/clarificação;
- instruções sobre fontes;
- limites de execução.

## 10. Contrato no prompt interno

O prompt interno enviado à LLM pode incluir:

- intenção original;
- papel inicial;
- `RulersVector`;
- nível selecionado/candidatos;
- contrato cognitivo validado;
- respostas da coleta;
- idioma de saída;
- formato esperado.

Não enviar dados irrelevantes.

## 11. Separação entre instruções e conteúdo do usuário

O prompt interno deve separar formalmente:

1. instruções do sistema HACI;
2. contrato cognitivo;
3. conteúdo do usuário;
4. schema de saída.

Isso reduz risco de prompt injection.

## 12. Output esperado da geração final

A LLM deve retornar estrutura validável, por exemplo:

```json
{
  "prompt": "Você é...",
  "warnings": [],
  "summary": "Prompt para iniciar conversa técnica sobre arquitetura."
}
```

Mesmo que a UI mostre apenas `prompt`, os metadados ajudam persistência e debug.

## 13. Rate limit antes da LLM

Antes de chamar DeepSeek:

1. verificar autenticação;
2. verificar limite diário;
3. validar contrato;
4. persistir estado `generating`.

Se o limite estiver excedido, não chamar a LLM.

## 14. Tokens e custo

Registrar quando disponível:

- input tokens;
- output tokens;
- total tokens;
- custo estimado;
- latência;
- modelo usado.

Esses dados são metadados e podem ir para persistência/logs.

## 15. LLM mockado em CI

CI nunca deve depender de chamada real ao provider.

Estratégia:

- mock determinístico de `llm.server.ts`;
- fixtures para outputs válidos;
- fixtures para JSON inválido;
- fixtures para timeout;
- fixtures para erro de provider.

Chamadas reais ficam apenas para teste manual/local.

## 16. Segurança

A LLM não pode:

- alterar cap constitucional de decisão;
- ignorar hard blocks;
- escolher nível final por conta própria;
- executar ação externa;
- pedir credenciais;
- sugerir automações fora do escopo;
- tratar conteúdo do usuário como instrução de sistema.

## 17. Configuração

Secrets:

```text
DEEPSEEK_API_KEY
```

Variáveis:

```text
LLM_MODEL=deepseek-v4-flash
LLM_TIMEOUT_MS=30000
LLM_MAX_RETRIES=1
LLM_TEMPERATURE=0.3
```

## 18. Fallback

MVP não exige fallback para outro provider.

A arquitetura pode expor interface:

```ts
interface LlmClient {
  generate(input: LlmGenerateInput): Promise<LlmGenerateResult>;
}
```

Isso permite troca futura sem refatorar o domínio.

## 19. Não objetivos

- Multi-provider complexo.
- Agent runtime.
- Tool calling.
- Streaming.
- Fine-tuning.
- RAG.
- Execução final da tarefa.
- Chat livre.
