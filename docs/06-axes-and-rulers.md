# Eixos Ortogonais e Réguas Cognitivas

## 1) Tese central

Formulação registrada:
> O comportamento de uma IA diante de um pedido pode ser descrito como a posição ocupada em um conjunto de **eixos ortogonais** de controle cognitivo. Perfis/níveis são pontos pré-configurados nesse espaço.

## 2) Os 9 eixos ortogonais fundamentais (modelo completo)

O material descreve um conjunto “mínimo e suficiente” de eixos para caracterizar comportamento de uma IA generalista:

1. **Inferência** — a IA pode deduzir além do explícito?
2. **Decisão** — a IA pode escolher/priorizar/concluir?
3. **Escopo** — qual o alcance do impacto da atuação?
4. **Fonte (contexto/verdade)** — de onde a IA pode tirar informação válida?
5. **Meta (meta-cognição)** — atua apenas no conteúdo ou também no processo?
6. **Regime de Execução** — agir vs. preparar (compilação vs execução)
7. **Tolerância a Ambiguidade** — parar e perguntar vs. assumir
8. **Estilo de saída / formalidade** — forma de apresentação
9. **Responsabilidade por erros** — gestão de risco e salvaguardas

Resumo tabular registrado (visão de engenharia):

| Eixo | Controla | Extremo baixo | Extremo alto |
| --- | --- | --- | --- |
| Inferência | Dedução implícita | Nenhuma | Máxima |
| Decisão | Autoridade de escolha | Zero | Parcial/Alta |
| Escopo | Alcance da ação | Local | Sistêmico |
| Fonte | Verdade permitida | Fechada | Aberta |
| Meta | Atuar no processo | 0 | Máxima |
| Execução | Agir vs preparar | Não executar | Executar |
| Ambiguidade | Reação ao vago | Parar | Assumir |
| Estilo | Forma da saída | Formal | Expressiva |
| Responsabilidade | Gestão de risco | Usuário | IA |

## 3) Por que nem todos os eixos viram “réguas” na UX

O material estabelece uma distinção:
> Nem todo eixo deve ser exposto; alguns são melhor derivados, e outros são constitucionais/políticas.

Classificação registrada:

- **Eixos de intenção consciente (exponíveis)**: o usuário entende e consegue controlar sem alto erro.
- **Eixos derivados (inferidos)**: consequências de papel + réguas + nível; expor cria redundância e contradições.
- **Eixos constitucionais (fixos/políticas)**: segurança/governança; não devem ser configuráveis diretamente.

## 4) As 5 réguas cognitivas canônicas (projeções expostas)

O conjunto canônico de réguas expostas (Etapa 2) é descrito como:

- **Inferência**
- **Decisão**
- **Escopo**
- **Fonte**
- **Função Meta**

Definição normativa:

- estas 5 réguas são a projeção canônica (UX/implementação) do modelo conceitual completo de 9 eixos;
- a semântica canônica (labels, hints e significado para a IA) é a do **JSON canônico**.

Observação de rastreabilidade:

- A versão textual completa dessas réguas está em `info/reguas-cognitivas-canonicas.md`.
- A versão parametrizada para UI (labels/hints/aiMeaning) está em `info/canonical-prompt-generator.json` (seção `stage2_cognitiveRulers`).
  - Em caso de divergência entre texto e JSON (ex.: semântica da régua `decision`), prevalece o JSON canônico (ver `12-constitution.md`).

## 5) Limites constitucionais (exemplo: régua Decisão)

Existe um limite constitucional explícito no runtime:

- `decision` **não pode exceder 3** (cap constitucional).

Semântica canônica da régua `decision` (valores válidos):

- `1`: nenhuma recomendação/priorização
- `2`: recomendação leve (com justificativa; decisão final humana)
- `3`: governança/bloqueio (autoridade para parar, bloquear e exigir clarificação)

Valores `4` e `5` são proibidos por design e devem ser bloqueados.

Definições normativas completas (incluindo precedência e outros limites) estão em `12-constitution.md`.

## 6) Exemplo de payload para a IA (serialização das réguas)

Na primeira chamada à IA (Etapa 2, derivação de critérios), os dados do Contrato Cognitivo são enviados de forma estruturada, não como texto solto. O material de origem sugere o seguinte formato conceitual para a serialização do papel inicial e das réguas:

```
Papel inicial: "Organizar / estruturar algo"

Parâmetros cognitivos:
- Inferência: 3/5
- Decisão: 2/5
- Escopo: 2/5
- Fonte: 1/5
- Função meta: 4/5
```

A IA, ao receber este payload, projeta os valores no espaço dos níveis canônicos, calcula o match e retorna os níveis compatíveis (ou um conflito bloqueante com explicação). O formato exato de serialização (JSON, texto estruturado, etc.) é detalhado nos artefatos canônicos (`docs/raw inputs/canonical-prompt-generator.json` e `docs/raw inputs/canonical-match.ts`).
