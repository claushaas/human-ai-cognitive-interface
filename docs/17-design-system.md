<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 17 — Design System

## 1. Direção visual

O design do HACI deve ser:

- sóbrio;
- técnico sem parecer frio;
- minimalista;
- textual;
- calmo;
- responsivo;
- acessível;
- levemente filosófico na linguagem, sem excesso conceitual na UI.

A interface deve parecer uma ferramenta de composição cuidadosa, não um SaaS genérico colorido nem um laboratório acadêmico pesado.

## 2. Princípios visuais

1. **Texto primeiro.**
2. **Poucos elementos por tela.**
3. **Hierarquia tipográfica clara.**
4. **Baixa saturação.**
5. **Movimento suave e raro.**
6. **Estados visíveis sem ruído.**
7. **Terminologia técnica escondida por padrão.**
8. **Modo avançado/debug separado da experiência principal.**

## 3. Tipografia

Fontes canônicas:

| Uso | Fonte |
|---|---|
| Headings | Averia Serif Libre |
| Corpo | Spectral |
| Código/JSON | Spectral |

As fontes podem ser carregadas via Google Fonts.

### Regras

- Headings devem ser expressivos, mas não ornamentais.
- Corpo deve priorizar legibilidade em textos médios.
- Código/JSON usa Spectral por decisão estética do projeto, mesmo não sendo monospace.
- Evitar blocos longos de leitura no fluxo principal.
- Textos técnicos extensos ficam no modo debug/documentação.

## 4. Cores

As cores devem ser resolvidas com `palette-kit`, usando OKLCH como espaço canônico.

### Fonte de geração

Usar `@clhaas/palette-kit` como resolvedor determinístico de paleta.

Configuração conceitual recomendada:

```ts
createPaletteKit({
  brand: {
    hue: 260,
    chroma: 0.08,
  },
  neutral: {
    hue: 70,
    chroma: 0.018,
  },
})
```

### Paleta base proposta

Os valores abaixo são tokens iniciais. A implementação deve preferir gerar/normalizar via `palette-kit`.

```css
:root {
  --haci-bg: oklch(0.975 0.012 78);
  --haci-surface: oklch(0.992 0.006 78);
  --haci-surface-muted: oklch(0.948 0.014 78);

  --haci-text: oklch(0.235 0.018 70);
  --haci-text-muted: oklch(0.46 0.018 70);
  --haci-text-subtle: oklch(0.62 0.014 70);

  --haci-border: oklch(0.86 0.014 78);
  --haci-border-strong: oklch(0.72 0.018 78);

  --haci-accent: oklch(0.43 0.08 260);
  --haci-accent-soft: oklch(0.88 0.045 260);
  --haci-accent-ink: oklch(0.28 0.075 260);

  --haci-warning: oklch(0.69 0.095 70);
  --haci-warning-soft: oklch(0.93 0.045 70);

  --haci-danger: oklch(0.58 0.11 32);
  --haci-danger-soft: oklch(0.92 0.04 32);

  --haci-success: oklch(0.55 0.07 145);
  --haci-success-soft: oklch(0.91 0.035 145);

  --haci-focus: oklch(0.55 0.11 260);
}
```

### Modo

- Modo padrão do MVP: light mode.
- Dark mode: fora do MVP obrigatório.
- A arquitetura de tokens deve permitir dark mode futuro.

## 5. Tailwind

Usar Tailwind puro.

Não usar shadcn/ui, Radix UI ou biblioteca visual como dependência obrigatória no MVP.

Tailwind deve consumir os tokens CSS de cor e manter classes previsíveis.

## 6. Layout

### Desktop

- largura máxima recomendada do fluxo: `720px–880px`;
- margem lateral generosa;
- painel debug pode aparecer lateralmente ou abaixo;
- evitar grids complexos.

### Mobile

- layout single-column;
- cards empilhados;
- área de ação no final da etapa;
- botões grandes o suficiente para toque;
- debug recolhido.

## 7. Componentes mínimos

### 7.1. App Shell

Responsável por:

- header simples;
- seletor de idioma;
- área principal;
- estado autenticado;
- link para histórico.

### 7.2. Step Container

Componente base para cada etapa.

Deve conter:

- título;
- descrição;
- conteúdo;
- ações primárias/secundárias;
- estado de validação.

### 7.3. Text Intent Input

Textarea para intenção inicial.

Regras:

- altura confortável;
- contador opcional;
- validação suave;
- exemplos discretos.

### 7.4. Role Card

Card selecionável para papel inicial.

Estados:

- default;
- hover;
- selected;
- disabled.

### 7.5. Cognitive Adjustment

Componente público para régua cognitiva.

Não usar o termo “régua” na UI principal.

Deve exibir:

- nome;
- pergunta curta;
- escala;
- hint do valor atual.

### 7.6. Match Summary

Resumo público da profundidade escolhida.

Estados:

- claro;
- ambíguo;
- bloqueado.

### 7.7. Correction Suggestion

Sugestão de ajuste local.

Deve ser textual, simples e aplicável com um clique.

### 7.8. Dynamic Question

Pergunta do protocolo de coleta.

Tipos:

- text;
- textarea;
- number;
- boolean;
- select;
- multiselect.

### 7.9. Review Panel

Resumo antes de gerar.

Inclui:

- intenção;
- papel;
- ajustes;
- detalhes;
- idioma;
- formato de saída.

### 7.10. Debug Panel

Painel recolhível.

Mostra dados internos:

- contrato;
- match;
- schemas;
- payloads;
- warnings.

### 7.11. Prompt Output

Área do prompt final.

Ações:

- copiar;
- exportar;
- novo prompt;
- feedback.

### 7.12. Toast / Inline Notice

Usar principalmente mensagens inline. Toasts apenas para ações transitórias como “copiado”.

## 8. Estados visuais

| Estado | Tratamento |
|---|---|
| Normal | superfície neutra |
| Selecionado | borda/acento azul profundo |
| Ambíguo | âmbar suave |
| Bloqueado | terracota suave |
| Sucesso | verde musgo discreto |
| Debug | borda pontilhada ou superfície levemente fria |
| Desabilitado | baixa opacidade, sem sumir completamente |

## 9. Microcopy

A linguagem deve ser:

- direta;
- levemente humana;
- conceitual sem jargão;
- firme quando necessário;
- suave em bloqueios.

Evitar:

- “contrato cognitivo” fora do debug;
- “nível N5” fora do debug;
- “hard block” fora do debug;
- mensagens excessivamente técnicas;
- tom motivacional genérico.

### Exemplos

Entrada:

> O que você quer conseguir com a IA?

Ajustes:

> Ajuste como a IA deve tratar o seu pedido.

Ambiguidade:

> Existem duas formas próximas de estruturar esse pedido.

Bloqueio:

> Preciso de mais clareza antes de gerar um prompt confiável.

Resultado:

> Seu prompt está pronto para ser copiado.

## 10. Acessibilidade

Meta: WCAG AA.

Requisitos:

- contraste adequado;
- labels explícitos;
- navegação por teclado nos controles principais;
- foco visível;
- semantic HTML;
- `aria-describedby` em hints relevantes;
- mensagens de erro associadas aos campos;
- não depender apenas de cor para estado.

Embora sliders não precisem ter alternativa específica além do controle acessível padrão no MVP, a implementação deve garantir operabilidade mínima via teclado quando o componente HTML permitir.

## 11. Movimento

Animações são permitidas se forem:

- suaves;
- rápidas;
- não essenciais;
- não repetitivas;
- sem parallax;
- sem distração.

Exemplos permitidos:

- transição de etapa;
- expandir/recolher debug;
- confirmação de cópia;
- mudança suave de estado.

## 12. Restrições

- Não usar estética neon/cyberpunk.
- Não usar excesso de badges.
- Não usar dashboard pesado no MVP.
- Não transformar debug em UI principal.
- Não depender de biblioteca visual externa.
