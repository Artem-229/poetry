DROP INDEX IF EXISTS idx_favorites_poem_id;
DROP TABLE IF EXISTS favorites;

DROP INDEX IF EXISTS idx_likes_poem_id;
DROP TABLE IF EXISTS likes;

DROP INDEX IF EXISTS idx_comments_poem_id;
DROP INDEX IF EXISTS idx_comments_user_id;
DROP TABLE IF EXISTS comments;

DROP INDEX IF EXISTS idx_poem_collections_collection_id;
DROP TABLE IF EXISTS poem_collections;
DROP TABLE IF EXISTS collections;

DROP INDEX IF EXISTS idx_poems_created_at;
DROP INDEX IF EXISTS idx_poems_author_id;
DROP TABLE IF EXISTS poems;

DROP INDEX IF EXISTS idx_users_email;
DROP TABLE IF EXISTS users;
