package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"

	"poetry/backend/internal/domain"
)

type InteractionRepo struct {
	db *pgxpool.Pool
}

func NewInteractionRepo(db *pgxpool.Pool) *InteractionRepo {
	return &InteractionRepo{db: db}
}

func (r *InteractionRepo) AddLike(ctx context.Context, userID, poemID int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	cmd, err := tx.Exec(ctx, `
		INSERT INTO likes (user_id, poem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
	`, userID, poemID)
	if err != nil {
		return err
	}

	if cmd.RowsAffected() > 0 {
		_, err = tx.Exec(ctx, `
			UPDATE poems SET likes_count = likes_count + 1 WHERE id = $1
		`, poemID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *InteractionRepo) RemoveLike(ctx context.Context, userID, poemID int64) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	cmd, err := tx.Exec(ctx, `DELETE FROM likes WHERE user_id=$1 AND poem_id=$2`, userID, poemID)
	if err != nil {
		return err
	}

	if cmd.RowsAffected() > 0 {
		_, err = tx.Exec(ctx, `
			UPDATE poems SET likes_count = likes_count - 1 WHERE id=$1 AND likes_count > 0
		`, poemID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(ctx)
}

func (r *InteractionRepo) AddFavorite(ctx context.Context, userID, poemID int64) error {
	_, err := r.db.Exec(ctx, `
		INSERT INTO favorites (user_id, poem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
	`, userID, poemID)
	return err
}

func (r *InteractionRepo) RemoveFavorite(ctx context.Context, userID, poemID int64) error {
	_, err := r.db.Exec(ctx, `DELETE FROM favorites WHERE user_id=$1 AND poem_id=$2`, userID, poemID)
	return err
}

func (r *InteractionRepo) GetUserFavorites(ctx context.Context, userID int64) ([]domain.Poem, error) {
	rows, err := r.db.Query(ctx, `
		SELECT p.id, p.title, p.content, p.author_id, p.likes_count, p.comments_count, p.created_at
		FROM poems p
		JOIN favorites f ON p.id = f.poem_id
		WHERE f.user_id = $1
		ORDER BY f.created_at DESC
	`, userID)
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

func (r *InteractionRepo) CheckLike(ctx context.Context, userID, poemID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM likes WHERE user_id=$1 AND poem_id=$2)
	`, userID, poemID).Scan(&exists)
	return exists, err
}

func (r *InteractionRepo) CheckFavorite(ctx context.Context, userID, poemID int64) (bool, error) {
	var exists bool
	err := r.db.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM favorites WHERE user_id=$1 AND poem_id=$2)
	`, userID, poemID).Scan(&exists)
	return exists, err
}
