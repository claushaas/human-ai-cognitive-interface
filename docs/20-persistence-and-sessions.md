<!--
HACI — Human-AI Cognitive Interface
Documento gerado a partir da documentação canônica existente e das decisões de produto/arquitetura consolidadas em 2026-05-05.
Idioma canônico: português (pt-BR).
-->
# 20 — Persistência e Sessões

## 1. Decisão canônica

O MVP terá persistência em **Cloudflare D1**, acessada via **Drizzle ORM**.

Persistir:

- inputs do usuário;
- contrato/estrutura gerada;
- prompt final;
- metadados de geração;
- feedback positivo/negativo;
- timestamps;
- estado da sessão.

Não persistir no MVP:

- anexos;
- conversas finais com IA;
- histórico externo;
- logs completos de infraestrutura com conteúdo do usuário.

## 2. Conceito de sessão

Uma `Session` representa uma geração de prompt.

Ela começa quando o usuário inicia um fluxo e termina quando o prompt final é gerado, exportado, copiado ou abandonado.

Uma sessão pode ser retomada se estiver salva como rascunho ou histórico.

## 3. Autenticação

MVP privado via **Cloudflare Access**.

Objetivos:

- restringir uso a pessoas autorizadas;
- obter identidade mínima do usuário;
- proteger custo de LLM;
- evitar construir auth custom cedo demais.

Cloudflare Access não é a solução definitiva para produto público futuro. A arquitetura deve permitir troca posterior para Clerk, Auth0, Supabase Auth ou auth própria.

## 4. Identidade do usuário

O usuário deve ser identificado a partir dos headers do Cloudflare Access.

Campos desejáveis:

- email;
- user id/subject;
- nome, se disponível.

Persistir internamente:

- `userId`;
- `email`;
- `createdAt`;
- `lastSeenAt`.

## 5. Retenção

Retenção canônica do MVP: **indefinida até exclusão manual pelo usuário**.

Não há expiração automática de sessões no MVP.

O usuário pode:

- apagar sessão;
- exportar sessão.

O usuário não pode:

- editar registros persistidos diretamente;
- alterar histórico após geração, exceto criando nova sessão.

## 6. Uso de dados

Dados podem ser usados apenas para melhorar:

- templates internos;
- prompts internos;
- critérios de coleta;
- UX do HACI.

Dados não serão usados para treinar modelos externos.

## 7. Logs

Logs operacionais devem guardar apenas metadados.

Permitido:

- session id;
- user id;
- etapa;
- status;
- timestamp;
- latência;
- modelo;
- tokens/custo, quando disponíveis;
- códigos de erro.

Evitar:

- input completo do usuário;
- prompt final completo;
- respostas intermediárias da LLM;
- dados sensíveis no log de infraestrutura.

O conteúdo persistido deve ficar no D1, não nos logs.

## 8. Banco de dados

Banco: Cloudflare D1.

ORM: Drizzle.

Migrations: versionadas no repositório.

## 9. Schema inicial

### users

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  access_subject TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);
```

### sessions

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  locale TEXT NOT NULL,
  input_text TEXT NOT NULL,
  desired_outcome TEXT,
  initial_role_id TEXT,
  rulers_json TEXT,
  level_match_json TEXT,
  contract_json TEXT,
  prompt TEXT,
  model TEXT,
  usage_json TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### collection_answers

```sql
CREATE TABLE collection_answers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  value_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

### feedback

```sql
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### rate_limits

```sql
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_type TEXT NOT NULL,
  count INTEGER NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, window_start, window_type),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 10. Status da sessão

| Status | Descrição |
|---|---|
| `draft` | sessão iniciada, ainda sem contrato completo |
| `collecting` | coletando detalhes |
| `ready` | pronta para gerar |
| `generating` | geração em andamento |
| `completed` | prompt final gerado |
| `failed` | falha técnica ou validação |
| `deleted` | apagada pelo usuário |

## 11. Criação de sessão

Uma sessão deve ser criada quando houver input inicial válido.

Fluxo:

1. autenticar usuário;
2. criar/atualizar usuário local;
3. validar input;
4. criar sessão `draft`;
5. avançar fluxo.

## 12. Atualização de sessão

A sessão é atualizada a cada etapa relevante:

- papel inicial;
- ajustes;
- resultado de match;
- respostas de coleta;
- contrato;
- prompt final;
- feedback.

Usar `updated_at` em toda mudança.

## 13. Exclusão

Exclusão deve ser lógica no MVP.

Ao apagar:

- preencher `deleted_at`;
- mudar status para `deleted`;
- esconder do histórico normal.

Futuro: exclusão física opcional.

## 14. Exportação

Exportar sessão deve gerar arquivo contendo:

- input original;
- estrutura pública;
- prompt final;
- timestamps;
- idioma;
- feedback, se houver.

O export não precisa conter todos os metadados internos, mas pode incluir contrato completo no modo debug/avançado.

Formatos MVP:

- Markdown;
- JSON opcional para debug.

## 15. Rate limit

Limite inicial:

```text
20 prompts por usuário por dia
```

Regra:

- contar somente gerações que chegam à chamada LLM;
- sessões abandonadas antes de gerar não consomem limite;
- erros técnicos após chamada podem consumir limite para evitar abuso;
- limite deve ser configurável.

## 16. D1 e JSON

Como D1 é SQLite, contratos complexos podem ser persistidos como JSON serializado em campos `TEXT`.

Isso é aceitável no MVP para:

- `rulers_json`;
- `level_match_json`;
- `contract_json`;
- `usage_json`.

Campos consultados frequentemente devem ser normalizados depois se necessário.

## 17. Migrações

Migrations devem ser explícitas e versionadas.

Exemplo:

```text
src/db/migrations/
  0001_initial.sql
  0002_add_feedback.sql
```

## 18. Privacidade

A interface deve deixar claro:

- o histórico fica salvo;
- o usuário pode apagar;
- o usuário pode exportar;
- os dados podem ser usados para melhorar o HACI internamente;
- os dados não treinam modelos externos.

## 19. Não objetivos

- Edição de histórico.
- Sincronização offline.
- Sessões colaborativas.
- Compartilhamento público por link.
- Retenção automática.
- Durable Objects.
