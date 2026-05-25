package domain

import "time"

type GalleryItem struct {
	ID        int64     `json:"id"`
	ImageURL  string    `json:"image_url"`
	Caption   string    `json:"caption"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}
