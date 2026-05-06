<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 16 — Fluxo de UX

## 1. Princípio de interação

A experiência do HACI deve ser guiada, não conversacional.

O usuário não conversa livremente com o sistema como em um chatbot. Ele é conduzido por uma sequência de etapas obrigatórias que transformam um resultado desejado em um prompt canônico.

A UX deve seguir a documentação canônica já existente para papéis iniciais, réguas cognitivas, match de nível, bloqueios, correções locais e protocolo de coleta.

## 2. Modelo principal

**Modelo:** wizard/formulário guiado com forte prevalência de texto.

**Não usar como experiência principal:**

- chat livre;
- canvas visual complexo;
- automação por agentes;
- editor técnico de JSON;
- fluxo pulável.

## 3. Jornada canônica

A jornada do MVP é:

1. **Entrada inicial**
2. **Papel inicial**
3. **Ajustes**
4. **Profundidade**
5. **Detalhes necessários**
6. **Revisão**
7. **Gerar**
8. **Resultado**
9. **Feedback**

## 4. Etapa 1 — Entrada inicial

### Objetivo

Capturar o resultado que o usuário deseja obter da IA.

### UI

- textarea principal;
- texto de apoio curto;
- botão de avanço;
- exemplos discretos.

### Microcopy sugerida

> O que você quer conseguir com a IA?

Texto auxiliar:

> Descreva o resultado esperado. Não precisa escrever um prompt perfeito agora.

### Validação

Bloquear avanço se:

- input estiver vazio;
- input for curto demais para estabelecer intenção mínima;
- input indicar tentativa de burlar o fluxo.

## 5. Etapa 2 — Papel inicial

### Objetivo

Dar um prior semântico ao sistema sem permitir escolha direta de nível.

### Opções canônicas

- Analisar
- Organizar / Sintetizar
- Explorar alternativas
- Apoiar decisão
- Documentar / Formalizar
- Transformar conteúdo

### UI

- lista de cards compactos;
- cada card com título e hint;
- seleção única.

### Regra

O usuário escolhe o papel, mas não escolhe diretamente o nível cognitivo.

## 6. Etapa 3 — Ajustes

### Objetivo

Permitir que o usuário posicione sua intenção nas cinco dimensões expostas do modelo.

### Nome público

Usar **Ajustes**, não “réguas cognitivas”, na interface principal.

### Ajustes canônicos

| Ajuste público | Eixo interno |
|---|---|
| Inferência | `inference` |
| Decisão | `decision` |
| Escopo | `scope` |
| Fonte | `source` |
| Função meta | `meta` |

### Escala

Escala canônica: `1..5`.

A régua **Decisão** tem cap constitucional:

- valores permitidos na prática: `1..3`;
- valores `4` e `5` são proibidos por design.

A UI não deve tornar `4` e `5` selecionáveis para decisão. Se aparecerem em modo debug, devem ser marcados como proibidos.

## 7. Etapa 4 — Profundidade

### Objetivo

Mostrar o resultado do match de nível sem expor complexidade excessiva.

### Nome público

Usar **Profundidade**.

### Comportamentos possíveis

#### Match forte

Quando o sistema seleciona um nível automaticamente, mostrar:

> A estrutura está clara o suficiente para avançar.

Não é necessário mostrar o nome interno do nível.

#### Match ambíguo

Quando houver 2–3 candidatos compatíveis, mostrar:

> Existem duas formas próximas de estruturar esse pedido.

A interface deve apresentar alternativas simples e, quando possível, oferecer ajustes locais.

#### Bloqueio

Quando houver hard block:

> Preciso de mais clareza antes de gerar um prompt confiável.

A mensagem deve ser suave, mas não permissiva.

## 8. Correções locais

Correções locais devem ser apresentadas como sugestões de ajuste, não como erro técnico.

Exemplo:

> Para reduzir ambiguidade, você pode diminuir “Inferência” em um ponto ou aumentar “Fonte” em um ponto.

Regras:

- no máximo 3 sugestões;
- alterar no máximo 2 ajustes por sugestão;
- variação máxima de ±1 por ajuste;
- sempre permitir manter escolhas atuais quando constitucionalmente possível;
- nunca sugerir ajuste que crie novo bloqueio.

## 9. Etapa 5 — Detalhes necessários

### Objetivo

Coletar critérios suficientes para gerar o prompt final.

### Nome público

Usar **Detalhes necessários**.

### Modelo

Formulário dinâmico orientado pelo protocolo de coleta.

Não usar chat livre.

### Perguntas

Cada pergunta deve ter:

- label;
- descrição curta;
- indicação se obrigatória;
- tipo de resposta;
- exemplo opcional;
- validação.

Tipos aceitos no MVP:

- texto curto;
- texto longo;
- número;
- booleano;
- seleção única;
- seleção múltipla.

Anexos ficam fora do MVP.

## 10. Etapa 6 — Revisão

### Objetivo

Permitir ao usuário revisar a estrutura antes da geração.

### Mostrar

- intenção original;
- papel escolhido;
- ajustes públicos;
- detalhes coletados;
- idioma de saída;
- formato esperado do prompt.

### Modo avançado/debug

Disponibilizar painel recolhível com:

- `RulersVector`;
- `LevelMatch`;
- `CognitiveContract`;
- critérios coletados;
- versão dos schemas.

Termos técnicos podem aparecer apenas aqui.

## 11. Etapa 7 — Gerar

### Nome da ação

Usar **Gerar**.

### Comportamento

Ao clicar em gerar:

1. validar contrato;
2. persistir sessão inicial;
3. chamar LLM internamente para compor o prompt;
4. validar output;
5. persistir prompt final;
6. mostrar resultado.

## 12. Etapa 8 — Resultado

### UI

- prompt final em área copiável;
- botão “Copiar prompt”;
- botão “Exportar”;
- botão “Criar novo”;
- feedback positivo/negativo.

### Importante

O produto deve deixar claro que o usuário deve copiar o prompt e usar em outra IA/conversa.

## 13. Etapa 9 — Feedback

Feedback mínimo:

- 👍 funcionou;
- 👎 não funcionou.

Sem formulário longo no MVP.

## 14. Estados de UI

Estados obrigatórios:

| Estado | Descrição |
|---|---|
| `idle` | aguardando entrada |
| `editing` | usuário preenchendo dados |
| `validating` | validação local/server |
| `matching` | match determinístico |
| `ambiguous` | múltiplos candidatos viáveis |
| `blocked` | bloqueio semântico/constitucional |
| `collecting` | coleta de detalhes |
| `reviewing` | revisão pré-geração |
| `generating` | geração do prompt |
| `completed` | prompt gerado |
| `failed` | erro técnico/validação |
| `exporting` | exportação em andamento |

## 15. Erros

Erros devem ser classificados em:

1. **Erro de entrada** — usuário precisa preencher melhor.
2. **Bloqueio cognitivo** — configuração contraditória ou insegura.
3. **Erro técnico** — falha em Worker, D1 ou LLM.
4. **Erro de limite** — limite diário atingido.

Mensagens devem ser claras e não técnicas na interface principal.

## 16. Mobile

O layout deve ser responsivo desde o MVP.

No mobile:

- etapas em tela única;
- cards empilhados;
- botões fixos no rodapé quando útil;
- painel debug recolhido por padrão;
- sliders/toggles devem ser confortáveis ao toque.

## 17. Restrições

- Não permitir pular etapas.
- Não permitir execução final fora da geração de prompt.
- Não expor JSON por padrão.
- Não transformar o fluxo em chat.
