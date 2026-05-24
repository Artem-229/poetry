package domain

import "time"

type Comment struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	UserEmail string    `json:"user_email"`
	PoemID    int64     `json:"poem_id"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"created_at"`
}
