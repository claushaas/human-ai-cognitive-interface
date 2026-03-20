# HACI - Planta Baixa de Engenharia

Este documento é uma planta baixa de engenharia do Human-AI Cognitive Interface (HACI). Ele consolida o fluxo canônico descrito ao longo da documentação e dos artefatos brutos, com um objetivo explícito: deixar o comportamento end-to-end compreensível sem depender da conversa que o originou.

## 1. Objetivo

O HACI não é um gerador simples de prompts. O objetivo dele é mediar a cognição antes da execução, separando:

1. a configuração do modelo de comportamento da IA, e
2. a especificação da tarefa real.

Essa separação é a restrição central do sistema. O usuário não vai direto para a execução. Primeiro, o sistema estabelece um contrato cognitivo. Só depois que esse contrato está válido ele coleta os detalhes faltantes da tarefa e executa.

Referências pertinentes:

- [02-system-overview.md](02-system-overview.md)
- [04-process-phases.md](04-process-phases.md)
- [12-constitution.md](12-constitution.md)

## 2. Hierarquia canônica de fontes

Quando o mesmo elemento do sistema aparece em múltiplas representações, a precedência é:

1. artefatos JSON canônicos
2. código
3. documentação em Markdown

Isso não é uma preferência estética. É uma regra constitucional para resolver conflitos e manter a implementação determinística.

Referências pertinentes:

- [12-constitution.md](12-constitution.md)
- [09-open-issues-and-gaps.md](09-open-issues-and-gaps.md)
- [raw inputs/canonical-prompt-generator.json](raw%20inputs/canonical-prompt-generator.json)
- [raw inputs/canonical-match.ts](raw%20inputs/canonical-match.ts)

## 3. Camadas arquiteturais

O sistema fica mais fácil de entender quando dividido em três camadas:

| Camada | Responsabilidade | Usa o modelo de IA? |
| --- | --- | --- |
| UI / orquestração | Coletar entradas do usuário, encaminhar etapas, exibir resultados, impor fronteiras de modo | Opcional |
| Motor determinístico | Calcular match, aplicar bloqueios duros, gerar correções, derivar critérios, montar esquemas | Não |
| Modelo de IA | Gerar protocolo estruturado de coleta, resolver tarefas de execução em linguagem natural, produzir perguntas mínimas de bloqueio quando necessário | Sim |

A fronteira importante é esta: o motor de match é puro e determinístico. Ele não depende de uma chamada a LLM para decidir o nível cognitivo.

Referências pertinentes:

- [07-level-matching.md](07-level-matching.md)
- [08-criteria-and-collection-protocol.md](08-criteria-and-collection-protocol.md)
- [raw inputs/canonical-match.ts](raw%20inputs/canonical-match.ts)
- [raw inputs/criteria-derivation-algorithm.md](raw%20inputs/criteria-derivation-algorithm.md)

## 4. Conceitos canônicos

### 4.1 Papel inicial

A Etapa 0 pergunta ao usuário que tipo de atividade ele quer que o sistema desempenhe. Os papéis canônicos expostos são:

- `role.analyze`
- `role.synthesize`
- `role.explore`
- `role.decideSupport`
- `role.document`
- `role.transform`

Os papéis adicionais `role.research` e `role.execute` existem como extensões internas de compatibilidade, mas não fazem parte do conjunto canônico exposto na Etapa 1.

Referências pertinentes:

- [05-initial-roles.md](05-initial-roles.md)
- [raw inputs/lista-canonica-de-papeis-iniciais.md](raw%20inputs/lista-canonica-de-papeis-iniciais.md)
- [raw inputs/canonical-prompt-generator.json](raw%20inputs/canonical-prompt-generator.json)

### 4.2 Réguas cognitivas

As réguas canônicas expostas são:

- inferência
- decisão
- escopo
- fonte
- meta

Essas cinco réguas são uma projeção de UX de um modelo comportamental mais amplo de nove eixos. Os outros eixos existem internamente, mas são tratados como derivados, constitucionais ou pós-processados, em vez de diretamente configuráveis pelo usuário.

Referências pertinentes:

- [06-axes-and-rulers.md](06-axes-and-rulers.md)
- [raw inputs/eixos-ortogonais-de-comportamento-da-ia.md](raw%20inputs/eixos-ortogonais-de-comportamento-da-ia.md)
- [raw inputs/eixos-ortogonais-e-reguas-cognitivas.md](raw%20inputs/eixos-ortogonais-e-reguas-cognitivas.md)
- [raw inputs/reguas-cognitivas-canonicas.md](raw%20inputs/reguas-cognitivas-canonicas.md)

### 4.3 Match de nível

O usuário não escolhe um nível cognitivo diretamente. O sistema o calcula por:

1. medir a distância Manhattan ponderada entre o vetor do usuário e o vetor de cada nível canônico,
2. aplicar bloqueios duros,
3. ranquear os candidatos por score,
4. aplicar correções pontuais de uma única vez, quando necessário,
5. retornar um nível selecionado, um conjunto curto de candidatos ou uma pergunta de bloqueio.

A decisão é constitucionalmente limitada a `3`. Valores `4` e `5` são proibidos.

Referências pertinentes:

- [07-level-matching.md](07-level-matching.md)
- [12-constitution.md](12-constitution.md)
- [raw inputs/sistema-canonico-de-match-de-nivel-cognitivo.md](raw%20inputs/sistema-canonico-de-match-de-nivel-cognitivo.md)
- [raw inputs/canonical-match.ts](raw%20inputs/canonical-match.ts)

### 4.4 Coleta de critérios

A Etapa 2 não executa a tarefa. Ela deriva os critérios mínimos e suficientes necessários para coletar, com segurança e clareza, as informações ainda faltantes. Se um critério já estiver implícito no contrato, ele vira um critério implícito e não deve ser perguntado de novo.

Referências pertinentes:

- [08-criteria-and-collection-protocol.md](08-criteria-and-collection-protocol.md)
- [raw inputs/criteria-collection-protocol-prompt.md](raw%20inputs/criteria-collection-protocol-prompt.md)
- [raw inputs/criteria-derivation-algorithm.md](raw%20inputs/criteria-derivation-algorithm.md)

## 5. Fluxo de ponta a ponta

O fluxo canônico possui quatro fases operacionais, além de dois pontos explícitos de chamada à IA.

### Fase 0 - Orientação de intenção

Objetivo:

- determinar o papel inicial
- reduzir ambiguidade semântica cedo
- evitar execução, decisão ou fabricação prematuras

O que acontece:

- o usuário escolhe um papel como analisar, sintetizar, explorar, apoiar decisão, documentar ou transformar
- o sistema usa esse papel como o prior semântico inicial para o restante do fluxo

Chamada à IA obrigatória?

- **Não**
- O fluxo canônico pode ser tratado por UI e lógica local
- Um diálogo opcional de onboarding assistido por IA é possível, mas não é uma etapa canônica obrigatória

Saída:

- `initialRole`

Referências pertinentes:

- [05-initial-roles.md](05-initial-roles.md)
- [13-system-flow-diagram.md](13-system-flow-diagram.md)
- [raw inputs/canonical-prompt-generator.json](raw%20inputs/canonical-prompt-generator.json)

### Fase 1 - Montagem do contrato cognitivo

Objetivo:

- definir como a IA pode pensar, inferir, decidir e delimitar sua ação
- converter intenção do usuário em um contrato cognitivo limitado

O que acontece:

1. O usuário define as cinco réguas canônicas.
2. O motor determinístico calcula os níveis candidatos.
3. Os bloqueios duros são avaliados antes da seleção final.
4. Os thresholds determinam se o sistema auto-seleciona, oferece candidatos ou bloqueia.
5. Se necessário, o motor propõe correções locais de uma única vez.

Restrições canônicas:

- `decision <= 3`
- `decision = 4` e `decision = 5` são proibidos
- N7 e N8 não devem ser apresentados como opções concorrentes no mesmo trilho operacional de N1..N6
- bloqueios duros sempre têm precedência sobre score

Chamada à IA obrigatória?

- **Não**
- O motor de match é puro e determinístico
- Os resultados são gerados localmente a partir dos artefatos canônicos

Saídas:

- objeto de contrato cognitivo
- nível selecionado, conjunto de candidatos ou estado de bloqueio
- conjunto opcional de sugestões de correção local

Referências pertinentes:

- [06-axes-and-rulers.md](06-axes-and-rulers.md)
- [07-level-matching.md](07-level-matching.md)
- [12-constitution.md](12-constitution.md)
- [raw inputs/canonical-match.ts](raw%20inputs/canonical-match.ts)
- [raw inputs/canonical-prompt-generator.json](raw%20inputs/canonical-prompt-generator.json)

### Fase 1b - Tratamento de bloqueios e correções

Objetivo:

- interromper matches inseguros ou incoerentes
- evitar loops repetidos de correção
- manter a interação do usuário limitada

O que acontece:

- o motor verifica bloqueios duros como limite de decisão, restrições de fonte e incompatibilidade de escopo
- se o match for fraco ou ambíguo, ele retorna um conjunto curto de candidatos e correções locais de uma única vez
- o usuário escolhe uma correção, ou escolhe nenhuma
- o sistema aplica a correção uma vez e segue adiante

Chamada à IA obrigatória?

- **Não**
- Se o produto quiser uma explicação em linguagem natural do bloqueio, a UI pode gerar ou solicitar isso, mas o motor canônico em si não precisa de uma LLM

Referências pertinentes:

- [07-level-matching.md](07-level-matching.md)
- [raw inputs/canonical-match.ts](raw%20inputs/canonical-match.ts)
- [raw inputs/sistema-canonico-de-match-de-nivel-cognitivo.md](raw%20inputs/sistema-canonico-de-match-de-nivel-cognitivo.md)

### Fase 2 - Derivação de critérios

Objetivo:

- determinar quais critérios de coleta são necessários e suficientes para a tarefa que vem a seguir
- evitar pedir informação redundante ou já implícita

O que acontece:

1. O sistema recebe como entrada o contrato cognitivo validado.
2. Ele deriva o conjunto mínimo de critérios a partir do contrato, do papel, das réguas e dos bloqueios duros.
3. Ele marca os critérios implícitos que não precisam ser perguntados.
4. Ele ordena os critérios para reduzir carga cognitiva.

Regra importante:

- esta fase ainda é preparação
- ela não pode executar a tarefa final

Chamada à IA obrigatória?

- **Sim**
- Esta é a primeira chamada obrigatória à IA no fluxo canônico
- A IA recebe o JSON do contrato e produz o JSON estruturado do protocolo de coleta

Entrada para a IA:

- JSON do contrato cognitivo
- contexto inicial opcional do usuário

Saída da IA:

- versão do protocolo
- resumo de papel, nível e réguas
- critérios implícitos
- blocos de critérios ordenados
- bloco de bloqueio e pergunta mínima, se necessário
- schema do payload de coleta

Referências pertinentes:

- [08-criteria-and-collection-protocol.md](08-criteria-and-collection-protocol.md)
- [raw inputs/criteria-collection-protocol-prompt.md](raw%20inputs/criteria-collection-protocol-prompt.md)
- [raw inputs/criteria-derivation-algorithm.md](raw%20inputs/criteria-derivation-algorithm.md)

### Fase 3 - Coleta com o usuário

Objetivo:

- coletar os detalhes faltantes da tarefa de forma estruturada
- manter a experiência conversacional, mas com conteúdo determinístico

O que acontece:

- o sistema apresenta os blocos derivados
- o usuário preenche os detalhes ausentes
- cada bloco pode ser tratado como uma hipótese de coleta, e não como um campo fixo de formulário

Chamada à IA obrigatória?

- **Não por padrão**
- Uma nova chamada à IA só é necessária se a coleta revelar um conflito semântico ou se o sistema precisar gerar uma pergunta mínima de bloqueio

Saídas:

- payload de coleta completo
- ou uma pergunta mínima de correção, se o contrato e a coleta solicitada forem incompatíveis

Referências pertinentes:

- [08-criteria-and-collection-protocol.md](08-criteria-and-collection-protocol.md)
- [raw inputs/criterios-canonicos-de-coleta.md](raw%20inputs/criterios-canonicos-de-coleta.md)

### Fase 4 - Execução final

Objetivo:

- executar a tarefa real sob o contrato cognitivo validado e o payload de coleta completo

O que acontece:

- o sistema combina o contrato com os inputs coletados
- o prompt final de execução é montado
- a IA é chamada com o payload final de execução

Chamada à IA obrigatória?

- **Sim**
- Esta é a segunda chamada obrigatória à IA no fluxo canônico

Saída:

- resultado final da tarefa

Referências pertinentes:

- [04-process-phases.md](04-process-phases.md)
- [12-constitution.md](12-constitution.md)
- [raw inputs/fases-de-criacao-do-prompt.md](raw%20inputs/fases-de-criacao-do-prompt.md)

## 6. Fronteiras canônicas de chamada

A tabela a seguir resume a estratégia canônica de chamadas:

| Etapa | Lógica local determinística | Chamada à IA obrigatória | Observações |
| --- | --- | --- | --- |
| Seleção de papel | Sim | Não | A UI pode ser totalmente local |
| Captura das réguas | Sim | Não | A entrada do usuário é coletada diretamente |
| Match de nível | Sim | Não | Função pura, sem chamada ao modelo |
| Avaliação de bloqueios | Sim | Não | Imposta por política |
| Correções locais | Sim | Não | Uma única vez, sem loop de correção |
| Derivação de critérios | Não | Sim | Primeira chamada obrigatória à IA |
| Coleta de dados faltantes | Sim | Opcional | Só chamar IA de novo se aparecer um conflito semântico |
| Execução final | Não | Sim | Segunda chamada obrigatória à IA |

## 7. Contratos de dados

### 7.1 Entrada do contrato cognitivo

O contrato cognitivo é a saída da fase de match e a entrada da fase de derivação de critérios.

Campos mínimos:

- `role`
- `levelMatch`
- `rulers`
- `hardBlocks`
- `correction` quando aplicável

Referências pertinentes:

- [10-spec-outline.md](10-spec-outline.md)
- [08-criteria-and-collection-protocol.md](08-criteria-and-collection-protocol.md)

### 7.2 Saída do protocolo de coleta

O protocolo de coleta deve conter:

- `protocolVersion`
- `role`
- `level`
- `rulers`
- `implicitCriteria`
- `criteria`
- `blockingIssue`
- `question`
- `collectionPayloadSchema`

Cada bloco de critério deve incluir:

- `id`
- `title`
- `instruction`
- `include`
- `avoid`
- `example`
- `rationale`

Referências pertinentes:

- [08-criteria-and-collection-protocol.md](08-criteria-and-collection-protocol.md)
- [raw inputs/criteria-collection-protocol-prompt.md](raw%20inputs/criteria-collection-protocol-prompt.md)

## 8. Regras de falha e bloqueio

O sistema deve parar e fazer a pergunta mínima necessária quando:

- o contrato estiver ausente, inválido ou incompleto
- existir um conflito semântico duro entre a tarefa solicitada e o contrato atual
- a operação solicitada violar a regra de preparação-only da Etapa 2
- um nível candidato violar limites constitucionais de decisão

O sistema não deve:

- executar a tarefa final durante a coleta
- permitir valores de decisão acima de `3`
- apresentar níveis operacionais e meta/constitucionais como escolhas concorrentes no mesmo conjunto de decisão do usuário
- criar loops repetidos de correção

Referências pertinentes:

- [07-level-matching.md](07-level-matching.md)
- [08-criteria-and-collection-protocol.md](08-criteria-and-collection-protocol.md)
- [12-constitution.md](12-constitution.md)

## 9. Forma recomendada de implementação

Se essa planta baixa for levada para código, a forma mais limpa de orquestração é:

1. A UI coleta o papel inicial.
2. A UI coleta as cinco réguas.
3. Um matcher determinístico calcula o contrato.
4. Uma camada de política determinística aplica bloqueios e limites de correção.
5. A IA é chamada uma vez para derivar o protocolo de coleta.
6. O usuário preenche os blocos resultantes.
7. A IA é chamada novamente para a tarefa final.

Essa separação mantém o sistema auditável, testável e resistente à deriva semântica.

## 10. Resumo

O HACI segue um fluxo estritamente orientado por contrato:

- intenção vem primeiro
- comportamento é configurado em seguida
- os detalhes da tarefa só são coletados depois que o contrato está válido
- a execução final só acontece depois que a coleta foi concluída

Em termos canônicos:

- o código determinístico cuida de match, bloqueio e correção
- a IA cuida da geração do protocolo e da execução final
- a Etapa 2 é apenas preparação
- a Etapa 3 é a primeira fase real de execução

Esse é o modelo de engenharia completo.
