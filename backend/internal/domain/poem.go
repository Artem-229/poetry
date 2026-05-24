package domain

import "time"

type Poem struct {
	ID            int64      `json:"id"`
	Title         string     `json:"title"`
	Content       string     `json:"content"`
	AuthorID      int64      `json:"author_id"`
	LikesCount    int64      `json:"likes_count"`
	CommentsCount int64      `json:"comments_count"`
	Genre         *string    `json:"genre"`
	WrittenAt     *time.Time `json:"written_at"`
	PublishedAt   time.Time  `json:"published_at"`
	CreatedAt     time.Time  `json:"created_at"`
}
