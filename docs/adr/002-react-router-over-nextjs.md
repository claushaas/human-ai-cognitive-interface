# ADR 002: React Router v7 Framework sobre Next.js

## Status

Aceito

## Contexto

A arquitetura do sistema requer:
- SSR (Server-Side Rendering) para SEO e performance inicial
- API embutida (actions/loaders) para eliminar latência
- Deploy em Cloudflare Workers
- Compatibilidade com o modelo mental de "páginas" por etapa

## Decisão

Usar **React Router v7 Framework** em vez de Next.js.

## Alternativas Consideradas

### 1. Next.js (App Router)

**Prós:**
- Ecossistema maduro
- Muitos exemplos e documentação
- Vercel deployment fácil

**Contras:**
- Lock-in na Vercel para features avançadas
- Arquitetura mais complexa (Server Components, etc.)
- Menos adequado para Cloudflare Workers

### 2. Remix

**Prós:**
- Precursor do React Router v7
- Excelente para formulários e mutations
- Boa integração com Cloudflare

**Contras:**
- Sendo gradualmente substituído pelo React Router v7
- Menos futuro-proof

### 3. React Router v7 Framework (Escolhido)

**Prós:**
- Evolução natural do Remix
- API de actions/loaders limpa
- Primeira classe para Cloudflare Workers
- Sem lock-in de vendor
- Mais simples que Next.js App Router

**Contras:**
- Ecossistema ainda crescendo
- Menos templates disponíveis

## Consequências

### Positivas
- API embutida elimina chamadas HTTP entre frontend/backend
- Deploy nativo em Cloudflare Workers
- Código mais simples e direto
- Controle total sobre o runtime

### Negativas
- Menos recursos prontos (imagem, fontes) que Next.js
- Comunidade menor

## Exemplo de Código

```typescript
// React Router v7 - Action embutida
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = await calculateMatch(formData);
  return json(result);
}

// No componente
export default function MatchPage() {
  const result = useActionData<typeof action>();
  // ...
}
```

## Referências

- [React Router v7 Documentation](https://reactrouter.com/)
- [ROADMAP.md - Etapa 3](./ROADMAP.md)
