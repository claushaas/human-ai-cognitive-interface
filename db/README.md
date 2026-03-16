# Database Layer

Cloudflare D1 (SQLite serverless) para persistência de dados.

## Schema

O schema SQL está em `db/schema.sql` e inclui:

- **sessions**: Sessões de interação com modo, estágio atual, contrato e protocolo
- **contracts**: Contratos cognitivos derivados (papel, nível, réguas, hard blocks)
- **collection_protocols**: Protocolos de coleta de critérios (critérios, blocos, payload)

## Uso

```typescript
import { createRepositories } from '~/db';

// Em um loader ou action do React Router
export async function action({ context }: ActionFunctionArgs) {
  const repos = createRepositories(context.cloudflare.env);

  // Criar sessão
  const session = await repos.sessions.create(sessionId, 'MODE_PREPARATION');

  // Atualizar sessão com contrato
  await repos.sessions.update(sessionId, { contract: cognitiveContract });

  // Criar contrato
  await repos.contracts.create(contractId, sessionId, cognitiveContract);

  // Criar protocolo de coleta
  await repos.collectionProtocols.create(
    protocolId,
    sessionId,
    contractId,
    criteria,
    blocks
  );
}
```

## Repositórios

- `SessionRepository`: CRUD de sessões
- `ContractRepository`: CRUD de contratos
- `CollectionProtocolRepository`: CRUD de protocolos de coleta
