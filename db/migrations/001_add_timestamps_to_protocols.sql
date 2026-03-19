-- Migration: Add created_at and updated_at columns to collection_protocols
-- Run this migration to fix the "no such column: created_at" error

-- Add created_at column with default value
ALTER TABLE collection_protocols ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Add updated_at column with default value
ALTER TABLE collection_protocols ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows to have the current timestamp
UPDATE collection_protocols SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
