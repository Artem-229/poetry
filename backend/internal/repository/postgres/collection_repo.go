package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"poetry/backend/internal/domain"
)

type CollectionRepo struct {
	db *pgxpool.Pool
}

func NewCollectionRepo(db *pgxpool.Pool) *CollectionRepo {
	return &CollectionRepo{db: db}
}

func (r *CollectionRepo) Create(ctx context.Context, c *domain.Collection) error {
	return r.db.QueryRow(ctx, `
		INSERT INTO collections (title, description)
		VALUES ($1, $2)
		RETURNING id, created_at
	`, c.Title, c.Description).Scan(&c.ID, &c.CreatedAt)
}

func (r *CollectionRepo) GetByID(ctx context.Context, id int64) (*domain.Collection, error) {
	var c domain.Collection
	err := r.db.QueryRow(ctx, `
		SELECT id, title, description, created_at FROM collections WHERE id=$1
	`, id).Scan(&c.ID, &c.Title, &c.Description, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CollectionRepo) List(ctx context.Context) ([]domain.Collection, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id, title, description, created_at FROM collections ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cols []domain.Collection
	for rows.Next() {
		var c domain.Collection
		if err := rows.Scan(&c.ID, &c.Title, &c.Description, &c.CreatedAt); err != nil {
			return nil, err
		}
		cols = append(cols, c)
	}
	return cols, rows.Err()
}

func (r *CollectionRepo) AddPoem(ctx context.Context, collectionID, poemID int64) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO poem_collections (poem_id, collection_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, poemID, collectionID)
	return err
}

func (r *CollectionRepo) RemovePoem(ctx context.Context, collectionID, poemID int64) error {
	_, err := r.db.Exec(ctx, `
		DELETE FROM poem_collections WHERE poem_id=$1 AND collection_id=$2
	`, poemID, collectionID)
	return err
}

func (r *CollectionRepo) GetPoems(ctx context.Context, collectionID int64) ([]domain.Poem, error) {
	rows, err := r.db.Query(ctx, `
		SELECT p.id, p.title, p.content, p.author_id, p.likes_count, p.comments_count, p.created_at
		FROM poems p
		JOIN poem_collections pc ON p.id = pc.poem_id
		WHERE pc.collection_id = $1
		ORDER BY p.created_at DESC
	`, collectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var poems []domain.Poem
	for rows.Next() {
		var p domain.Poem
		if err := rows.Scan(&p.ID, &p.Title, &p.Content, &p.AuthorID, &p.LikesCount, &p.CommentsCount, &p.CreatedAt); err != nil {
			return nil, err
		}
		poems = append(poems, p)
	}
	return poems, rows.Err()
}

func (r *CollectionRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM collections WHERE id=$1`, id)
	return err
}
