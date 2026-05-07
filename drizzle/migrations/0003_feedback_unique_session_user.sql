-- Add unique constraint on feedback per session + user to allow upsert
CREATE UNIQUE INDEX IF NOT EXISTS feedback_session_user_unique ON feedback (session_id, user_id);
