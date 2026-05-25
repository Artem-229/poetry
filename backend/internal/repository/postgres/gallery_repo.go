package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"poetry/backend/internal/domain"
)

type GalleryRepo struct {
	db *pgxpool.Pool
}

func NewGalleryRepo(db *pgxpool.Pool) *GalleryRepo {
	return &GalleryRepo{db: db}
}

func (r *GalleryRepo) List(ctx context.Context) ([]domain.GalleryItem, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, image_url, caption, sort_order, created_at FROM gallery ORDER BY sort_order ASC, created_at ASC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.GalleryItem
	for rows.Next() {
		var it domain.GalleryItem
		if err := rows.Scan(&it.ID, &it.ImageURL, &it.Caption, &it.SortOrder, &it.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, it)
	}
	return items, rows.Err()
}

func (r *GalleryRepo) Create(ctx context.Context, imageURL, caption string, sortOrder int) (domain.GalleryItem, error) {
	var it domain.GalleryItem
	err := r.db.QueryRow(ctx,
		`INSERT INTO gallery (image_url, caption, sort_order) VALUES ($1, $2, $3)
		 RETURNING id, image_url, caption, sort_order, created_at`,
		imageURL, caption, sortOrder,
	).Scan(&it.ID, &it.ImageURL, &it.Caption, &it.SortOrder, &it.CreatedAt)
	return it, err
}

func (r *GalleryRepo) GetByID(ctx context.Context, id int64) (domain.GalleryItem, error) {
	var it domain.GalleryItem
	err := r.db.QueryRow(ctx,
		`SELECT id, image_url, caption, sort_order, created_at FROM gallery WHERE id = $1`, id,
	).Scan(&it.ID, &it.ImageURL, &it.Caption, &it.SortOrder, &it.CreatedAt)
	return it, err
}

func (r *GalleryRepo) Update(ctx context.Context, id int64, caption string, sortOrder int) error {
	_, err := r.db.Exec(ctx,
		`UPDATE gallery SET caption = $1, sort_order = $2 WHERE id = $3`,
		caption, sortOrder, id,
	)
	return err
}

func (r *GalleryRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM gallery WHERE id = $1`, id)
	return err
}
