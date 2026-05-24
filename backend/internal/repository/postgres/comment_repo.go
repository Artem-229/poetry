package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"poetry/backend/internal/domain"
)

type CommentRepo struct {
	db *pgxpool.Pool
}

func NewCommentRepo(db *pgxpool.Pool) *CommentRepo {
	return &CommentRepo{db: db}
}

func (r *CommentRepo) Create(ctx context.Context, c *domain.Comment) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	err = tx.QueryRow(ctx, `
		INSERT INTO comments (user_id, poem_id, text)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`, c.UserID, c.PoemID, c.Text).Scan(&c.ID, &c.CreatedAt)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		UPDATE poems SET comments_count = comments_count + 1 WHERE id = $1
	`, c.PoemID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *CommentRepo) Delete(ctx context.Context, id int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var poemID int64
	err = tx.QueryRow(ctx, `DELETE FROM comments WHERE id=$1 RETURNING poem_id`, id).Scan(&poemID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(ctx, `
		UPDATE poems SET comments_count = comments_count - 1
		WHERE id=$1 AND comments_count > 0
	`, poemID)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *CommentRepo) ListByPoem(ctx context.Context, poemID int64) ([]domain.Comment, error) {
	rows, err := r.db.Query(ctx, `
		SELECT c.id, c.user_id, u.email, c.poem_id, c.text, c.created_at
		FROM comments c
		JOIN users u ON c.user_id = u.id
		WHERE c.poem_id = $1
		ORDER BY c.created_at ASC
	`, poemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []domain.Comment
	for rows.Next() {
		var c domain.Comment
		if err := rows.Scan(&c.ID, &c.UserID, &c.UserEmail, &c.PoemID, &c.Text, &c.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}

	return comments, rows.Err()
}
