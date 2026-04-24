-- USERS
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       email TEXT NOT NULL UNIQUE,
                       password_hash TEXT NOT NULL,
                       role TEXT NOT NULL DEFAULT 'USER',
                       created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- POEMS
CREATE TABLE poems (
                       id BIGSERIAL PRIMARY KEY,
                       title TEXT NOT NULL,
                       content TEXT NOT NULL,
                       author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       likes_count BIGINT NOT NULL DEFAULT 0,
                       comments_count BIGINT NOT NULL DEFAULT 0,
                       created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_poems_author_id ON poems(author_id);
CREATE INDEX idx_poems_created_at ON poems(created_at DESC);

-- COLLECTIONS
CREATE TABLE collections (
                             id BIGSERIAL PRIMARY KEY,
                             title TEXT NOT NULL,
                             description TEXT,
                             created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- MANY-TO-MANY (poem_collections)
CREATE TABLE poem_collections (
                                  poem_id BIGINT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
                                  collection_id BIGINT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
                                  PRIMARY KEY (poem_id, collection_id)
);

CREATE INDEX idx_poem_collections_collection_id ON poem_collections(collection_id);

-- COMMENTS
CREATE TABLE comments (
                          id BIGSERIAL PRIMARY KEY,
                          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                          poem_id BIGINT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
                          text TEXT NOT NULL,
                          created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_poem_id ON comments(poem_id);

-- LIKES (IDEMPOTENT)
CREATE TABLE likes (
                       user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       poem_id BIGINT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
                       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                       PRIMARY KEY (user_id, poem_id)
);

CREATE INDEX idx_likes_poem_id ON likes(poem_id);

-- FAVORITES
CREATE TABLE favorites (
                           user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                           poem_id BIGINT NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
                           created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                           PRIMARY KEY (user_id, poem_id)
);

CREATE INDEX idx_favorites_poem_id ON favorites(poem_id);