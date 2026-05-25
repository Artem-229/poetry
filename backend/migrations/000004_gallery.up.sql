CREATE TABLE gallery (
    id         BIGSERIAL PRIMARY KEY,
    image_url  TEXT NOT NULL,
    caption    TEXT NOT NULL DEFAULT '',
    sort_order INT  NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
