DROP INDEX IF EXISTS idx_poems_published_at;
ALTER TABLE poems
  DROP COLUMN IF EXISTS genre,
  DROP COLUMN IF EXISTS written_at,
  DROP COLUMN IF EXISTS published_at;
CREATE INDEX idx_poems_created_at ON poems(created_at DESC);
