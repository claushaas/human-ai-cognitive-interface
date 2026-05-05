# Terminologia e Nomeação

## 1) Nomeação do sistema (famílias de nomes)

O material de origem propõe famílias de nomes para o sistema, cada uma com um “jeito” de explicar o mesmo objeto:

### 1.1 Família “Interface Humano–IA”

Enquadra como uma camada intermediária (não a IA em si), uma **interface cognitiva**:

- *Human–AI Interface*
- *Cognitive Interface*
- *Human–AI Cognitive Interface*
- *Intent Interface*
- *Cognitive Mediation Layer*

### 1.2 Família “Contrato / Protocolo”

Enquadra como algo normativo (quase jurídico), um acordo explícito:

- *AI Cognitive Contract*
- *Human–AI Contract System*
- *Prompt Contract Engine*
- *Cognitive Contract Layer*
- *Intent Contract Protocol*

### 1.3 Família “Intenção → Execução”

Enquadra como um fluxo de transformação de ambiguidade em executabilidade:

- *Intent-to-Execution Interface*
- *Intent Resolution System*
- *Intent Compiler*
- *Intent-to-Task Compiler*
- *Semantic Intent Engine*

### 1.4 Família “Cognitiva / Metacognitiva”

Enquadra como alinhamento e modelagem de cognição:

- *Cognitive Alignment System*
- *Metacognitive Interface*
- *Cognition Shaping Layer*
- *Cognitive Alignment Engine*
- *Intentionality Engine*

### 1.5 Família “Arquitetura de Linguagem”

Enquadra como formalização de linguagem operacional:

- *Prompt Architecture*
- *Semantic Architecture Layer*
- *Operational Language Interface*
- *Instruction Architecture*
- *Executable Language Interface*

### 1.6 Recomendações registradas

Há uma recomendação explícita de nome "que aguenta produto + paper + GitHub + palestra":

- **Human–AI Cognitive Interface**

Além dessa, o material de origem lista outras 5 "combinações canônicas" de nomes consideradas fortes o suficiente para múltiplos contextos:

- **Intent Compiler**
- **Cognitive Contract Engine**
- **Intent Resolution Interface**
- **Metacognitive Prompt Architecture**
- **Cognitive Alignment Interface**

### 1.7 Metaprompt Engine (nome interno)

Há uma discussão específica sobre **Metaprompt Engine** como nome técnico/interno:

O que ele acerta:

- **"Meta"**: comunica claramente que o sistema atua *antes* do prompt — no nível de estrutura, intenção e controle.
- **"Engine"**: indica mecanismo, não UI; algo determinístico, operacional, sério.
- **Alinhamento técnico**: faz sentido para quem já vive em LLMs, agentes, pipelines.

Onde ele limita:

- **Redução semântica**: "prompt" ainda puxa o imaginário para texto/LLM. O sistema é maior: contrato cognitivo, governança, thresholds, bloqueios.
- **Público**: para não-técnicos (ou decisores), "Metaprompt" soa esotérico ou redundante ("prompt do prompt?").
- **Evolução futura**: se amanhã isso vira mediação humano–agente, ou multi-IA, o termo "prompt" pode ficar estreito.

Posicionamento recomendado:

- **Nome do sistema (externo/público)**: Human–AI Cognitive Interface
- **Nome do núcleo (interno/técnico)**: Metaprompt Engine

Ou, alternativamente: Cognitive Contract Engine (powered by the Metaprompt Engine).

Veredito: **Metaprompt Engine** descreve bem *o motor*, mas não representa tudo o que o sistema é — a estrada, as leis de trânsito e o mapa.

## 2) Definições canônicas (termos)

### 2.1 Contrato Cognitivo da IA (entrada obrigatória)

Definido como um conjunto normativo produzido antes da execução, contendo, no mínimo:

- `role` (papel inicial)
- `levelMatch` (nível canônico escolhido + score)
- `rulers` (réguas cognitivas canônicas, discretizadas)
- `hardBlocks` (bloqueios semânticos aplicáveis)
- `correction` (opcional; correção escolhida pelo usuário, sem recálculo)

### 2.2 Critério de Coleta (unidade lógica)

Definido como uma necessidade semântica que, se não for satisfeita, torna a execução posterior:

- ambígua, ou
- não verificável, ou
- fora de escopo, ou
- insegura (deriva de inferência/autoridade/execução).

Observação também explícita:

- **Critério ≠ campo fixo.**
- Um critério pode ser resolvido implicitamente pelo contrato (sem virar pergunta).

### 2.3 Protocolo de Coleta (saída da Etapa 2)

Definido como uma lista ordenada de blocos (perguntas/instruções) que:

- coletam apenas o mínimo necessário;
- não repetem o que o contrato já fixa;
- incluem micro-exemplos alinhados a papel/nível/réguas;
- geram, ao final, um pacote de inputs textuais para compor o Prompt Canônico (execução futura).

### 2.4 Eixos ortogonais vs. réguas

Definição operacional:

- **Eixos ortogonais**: dimensões internas completas (modelo de comportamento “necessário e suficiente”).
- **Réguas cognitivas canônicas**: projeções (subconjunto) expostas ao usuário por serem controláveis com baixa taxa de erro humano.

### 2.5 Níveis canônicos

Definição operacional:

- níveis são pontos/presets no espaço cognitivo;
- o usuário não escolhe nível diretamente; o sistema calcula match e reduz para 2–3 opções compatíveis (ou seleciona automaticamente em match forte).
