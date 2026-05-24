package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"poetry/backend/internal/domain"
)

type PoemRepo struct {
	db *pgxpool.Pool
}

func NewPoemRepo(db *pgxpool.Pool) *PoemRepo {
	return &PoemRepo{db: db}
}

func (r *PoemRepo) Create(ctx context.Context, poem *domain.Poem) error {
	if poem.PublishedAt.IsZero() {
		poem.PublishedAt = time.Now()
	}

	query := `
		INSERT INTO poems (title, content, author_id, genre, written_at, published_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, published_at
	`

	return r.db.QueryRow(ctx, query,
		poem.Title,
		poem.Content,
		poem.AuthorID,
		poem.Genre,
		poem.WrittenAt,
		poem.PublishedAt,
	).Scan(&poem.ID, &poem.CreatedAt, &poem.PublishedAt)
}

func (r *PoemRepo) Update(ctx context.Context, poem *domain.Poem) error {
	if poem.PublishedAt.IsZero() {
		poem.PublishedAt = time.Now()
	}

	query := `
		UPDATE poems
		SET title=$1, content=$2, genre=$3, written_at=$4, published_at=$5
		WHERE id=$6
	`

	_, err := r.db.Exec(ctx, query,
		poem.Title,
		poem.Content,
		poem.Genre,
		poem.WrittenAt,
		poem.PublishedAt,
		poem.ID,
	)
	return err
}

func (r *PoemRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM poems WHERE id=$1`, id)
	return err
}

func (r *PoemRepo) GetByID(ctx context.Context, id int64) (*domain.Poem, error) {
	var poem domain.Poem

	query := `
		SELECT id, title, content, author_id, likes_count, comments_count,
		       genre, written_at, published_at, created_at
		FROM poems
		WHERE id=$1
	`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&poem.ID,
		&poem.Title,
		&poem.Content,
		&poem.AuthorID,
		&poem.LikesCount,
		&poem.CommentsCount,
		&poem.Genre,
		&poem.WrittenAt,
		&poem.PublishedAt,
		&poem.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &poem, nil
}

func (r *PoemRepo) List(ctx context.Context, limit, offset int, sort string) ([]domain.Poem, error) {
	order := "published_at DESC"

	if sort == "popular" {
		order = "(likes_count + comments_count * 2) DESC"
	}

	query := fmt.Sprintf(`
		SELECT id, title, content, author_id, likes_count, comments_count,
		       genre, written_at, published_at, created_at
		FROM poems
		ORDER BY %s
		LIMIT $1 OFFSET $2
	`, order)

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	poems := make([]domain.Poem, 0, limit)

	for rows.Next() {
		var p domain.Poem

		err := rows.Scan(
			&p.ID,
			&p.Title,
			&p.Content,
			&p.AuthorID,
			&p.LikesCount,
			&p.CommentsCount,
			&p.Genre,
			&p.WrittenAt,
			&p.PublishedAt,
			&p.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		poems = append(poems, p)
	}

	if rows.Err() != nil {
		return nil, rows.Err()
	}

	return poems, nil
}
