-- D1 Database Schema for Human-AI Cognitive Interface

-- Sessions table
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL CHECK (mode IN ('MODE_PREPARATION', 'MODE_GOVERNANCE', 'MODE_EXECUTION')),
    current_stage INTEGER NOT NULL DEFAULT 0,
    contract TEXT,
    protocol TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE contracts (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    level_match TEXT NOT NULL,
    rulers TEXT NOT NULL,
    hard_blocks TEXT,
    correction TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Collection Protocols table
CREATE TABLE collection_protocols (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
    contract_id TEXT REFERENCES contracts(id) ON DELETE CASCADE,
    criteria TEXT NOT NULL,
    blocks TEXT NOT NULL,
    payload TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_sessions_mode ON sessions(mode);
CREATE INDEX idx_contracts_session ON contracts(session_id);
CREATE INDEX idx_protocols_session ON collection_protocols(session_id);
