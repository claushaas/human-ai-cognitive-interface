# tests/fixtures/

Diretório reservado para fixtures JSON e golden tests do HACI.

Nesta fase, ainda não há engine, contratos ou dados canônicos implementados em código. Futuramente, este diretório conterá:

- `match/` — fixtures para matching de níveis (N1, N5, bloqueios, ambiguidades).
- `contracts/` — contratos válidos e inválidos para validação de schemas.
- `llm/` — outputs mockados de LLM (prompt válido, JSON inválido, timeout, erro).
- `sessions/` — fixtures de sessão para testes de persistência e histórico.

Os arquivos devem ser JSON legíveis e versionados.
