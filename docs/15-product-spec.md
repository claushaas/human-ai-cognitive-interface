<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 15 — Especificação de Produto

## 1. Identidade do produto

**Nome canônico:** HACI — Human-AI Cognitive Interface.

**Natureza do produto:** aplicação web utilizável, inicialmente privada, construída como produto final e protótipo validável. O MVP deve servir ao uso próprio e a um grupo restrito de amigos/usuários convidados. A arquitetura deve preservar caminho futuro para produto público, mas sem antecipar complexidade comercial desnecessária.

**Relação com STOA/TELOS:** conceitualmente independente. HACI pode compartilhar sensibilidade de design e rigor conceitual com outros projetos, mas sua documentação, nomenclatura e operação não dependem do ecossistema STOA/TELOS.

**Idioma canônico da documentação:** português do Brasil.

**Website/interface:** bilíngue, português e inglês.

## 2. Tese do produto

HACI é uma camada anterior ao chat com IA. Sua função é transformar uma intenção inicial em um prompt canônico, estruturado e mais adequado para iniciar ou redirecionar uma conversa com uma LLM.

HACI não é, no MVP:

- um chatbot generalista;
- um executor autônomo de tarefas;
- uma IDE de agentes;
- uma ferramenta de automação externa;
- um substituto para o julgamento humano.

## 3. Promessa principal

> Inicie conversas mais assertivas com uma IA.

Essa promessa deve aparecer no produto de forma simples. A sofisticação cognitiva pode ser visível para usuários avançados, mas a interface principal deve orientar o usuário sem sobrecarregá-lo com terminologia interna.

## 4. Usuários iniciais

O MVP deve atender quatro perfis iniciais:

1. **Usuário fundador** — uso próprio, validação conceitual e técnica.
2. **Desenvolvedores** — pessoas que usam IA para código, arquitetura, revisão técnica e documentação.
3. **Usuários avançados de IA** — pessoas que percebem que a qualidade da pergunta altera profundamente a qualidade da resposta.
4. **Pessoas não técnicas** — usuários que sabem o resultado desejado, mas não sabem formular um prompt adequado.

O produto não é inicialmente voltado a equipes, colaboração multiusuário em tempo real ou gestão organizacional.

## 5. Problema do usuário

O problema central é:

> O usuário espera uma boa resposta de uma LLM, mas não sabe formular a pergunta de modo que a IA entenda corretamente o resultado desejado, o nível de inferência permitido, o grau de decisão esperado, as fontes aceitáveis, o escopo e a forma de saída.

Em vez de pedir que o usuário domine engenharia de prompt, HACI conduz uma coleta estruturada e gera um prompt inicial de melhor qualidade.

## 6. Situação de uso

O uso canônico acontece no início de uma nova conversa com IA.

Também é válido usar HACI para gerar um prompt que mude o contexto de uma conversa existente, desde que o produto deixe claro que o output gerado é um prompt para ser copiado e usado em outro ambiente.

## 7. Output principal

O output principal do MVP é um **prompt final**.

O sistema termina quando:

1. coleta a intenção inicial;
2. conduz as etapas obrigatórias;
3. deriva a estrutura cognitiva necessária;
4. gera um prompt canônico;
5. permite copiar/exportar o resultado.

O MVP não executa uma conversa final com o usuário. A LLM é usada internamente para geração/derivação do prompt, mas o HACI não deve se apresentar como chat final de destino.

## 8. Escopo do MVP

O MVP inclui:

- aplicação web responsiva;
- autenticação privada por Cloudflare Access;
- suporte multiusuário;
- geração de prompt final;
- histórico de prompts gerados;
- persistência dos inputs e outputs principais;
- cópia do prompt final;
- exportação da sessão;
- interface visual com ajustes/réguas cognitivas;
- modo avançado/debug com contrato cognitivo;
- suporte explícito a português e inglês;
- feedback simples positivo/negativo após geração.

O MVP não inclui:

- anexos;
- execução final da tarefa pelo HACI;
- chat conversacional livre;
- modo rápido;
- modo rigoroso alternativo;
- pular etapas;
- colaboração em equipe;
- integração com ferramentas externas;
- marketplace de prompts;
- treinamento/fine-tuning de modelos.

## 9. Jornada de produto

O usuário chega com um resultado desejado. O sistema conduz a transformação desse desejo em prompt por meio de uma sequência obrigatória:

1. intenção inicial;
2. escolha de papel inicial;
3. ajustes cognitivos;
4. match determinístico de nível;
5. coleta de detalhes necessários;
6. revisão;
7. geração do prompt;
8. cópia/exportação;
9. feedback simples.

A interface não deve permitir pular etapas no MVP, porque a validação do conceito depende da fidelidade ao fluxo cognitivo.

## 10. Transparência conceitual

O usuário deve saber que está usando um sistema cognitivo, mas a interface principal não deve expor termos internos como “contrato cognitivo”, “réguas” ou “nível” fora do modo avançado/debug.

Termos públicos recomendados:

| Conceito interno | Nome público |
|---|---|
| Réguas cognitivas | Ajustes |
| Nível cognitivo | Profundidade |
| Contrato cognitivo | Estrutura do prompt |
| Coleta de critérios | Detalhes necessários |
| Execução/geração | Gerar |
| Hard block | Preciso de mais clareza |

## 11. Critérios de sucesso

O MVP é bem-sucedido se gerar prompts canônicos satisfatórios de forma consistente.

Métricas qualitativas e quantitativas:

- qualidade percebida do prompt gerado;
- clareza da estrutura do prompt;
- redução de ambiguidade;
- satisfação subjetiva do usuário;
- menor número de rodadas necessárias com a IA de destino;
- consistência entre inputs semelhantes e prompts resultantes;
- taxa de feedback positivo;
- taxa de sessões concluídas;
- taxa de cópia do prompt final.

Não haverá A/B test formal contra prompts diretos no ChatGPT no MVP.

## 12. Feedback

O MVP deve capturar apenas feedback simples:

- positivo;
- negativo.

Opcionalmente, pode haver um campo textual em versão futura. No MVP, evitar atrito.

## 13. Princípios de produto

1. **Camada anterior, não destino final.**
2. **Prompt como artefato.**
3. **Usuário mantém controle.**
4. **Nenhuma execução autônoma.**
5. **Fidelidade ao modelo cognitivo existente.**
6. **Interface simples; estrutura interna rigorosa.**
7. **Privado primeiro, expansível depois.**
