package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SiteContentRepo struct {
	db *pgxpool.Pool
}

func NewSiteContentRepo(db *pgxpool.Pool) *SiteContentRepo {
	return &SiteContentRepo{db: db}
}

func (r *SiteContentRepo) GetAll(ctx context.Context) (map[string]string, error) {
	rows, err := r.db.Query(ctx, `SELECT key, value FROM site_content`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]string)
	for rows.Next() {
		var k, v string
		if err := rows.Scan(&k, &v); err != nil {
			return nil, err
		}
		result[k] = v
	}
	return result, rows.Err()
}

func (r *SiteContentRepo) Set(ctx context.Context, data map[string]string) error {
	for k, v := range data {
		_, err := r.db.Exec(ctx, `
			INSERT INTO site_content (key, value)
			VALUES ($1, $2)
			ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
		`, k, v)
		if err != nil {
			return err
		}
	}
	return nil
}
