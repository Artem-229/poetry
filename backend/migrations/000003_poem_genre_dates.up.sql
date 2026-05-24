ALTER TABLE poems
  ADD COLUMN genre        TEXT,
  ADD COLUMN written_at   TIMESTAMP,
  ADD COLUMN published_at TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE poems SET published_at = created_at;

DROP INDEX IF EXISTS idx_poems_created_at;
CREATE INDEX idx_poems_published_at ON poems(published_at DESC);
