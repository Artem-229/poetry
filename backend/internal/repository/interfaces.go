package repository

import (
	"context"

	"poetry/backend/internal/domain"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
	GetByID(ctx context.Context, id int64) (*domain.User, error)
}

type PoemRepository interface {
	Create(ctx context.Context, poem *domain.Poem) error
	Update(ctx context.Context, poem *domain.Poem) error
	Delete(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*domain.Poem, error)
	List(ctx context.Context, limit, offset int, sort string) ([]domain.Poem, error)
}

type CommentRepository interface {
	Create(ctx context.Context, c *domain.Comment) error
	Delete(ctx context.Context, id int64) error
	ListByPoem(ctx context.Context, poemID int64) ([]domain.Comment, error)
}

type InteractionRepository interface {
	AddLike(ctx context.Context, userID, poemID int64) error
	RemoveLike(ctx context.Context, userID, poemID int64) error
	AddFavorite(ctx context.Context, userID, poemID int64) error
	RemoveFavorite(ctx context.Context, userID, poemID int64) error
	GetUserFavorites(ctx context.Context, userID int64) ([]domain.Poem, error)
	CheckLike(ctx context.Context, userID, poemID int64) (bool, error)
	CheckFavorite(ctx context.Context, userID, poemID int64) (bool, error)
}

type CollectionRepository interface {
	Create(ctx context.Context, c *domain.Collection) error
	GetByID(ctx context.Context, id int64) (*domain.Collection, error)
	List(ctx context.Context) ([]domain.Collection, error)
	AddPoem(ctx context.Context, collectionID, poemID int64) error
	RemovePoem(ctx context.Context, collectionID, poemID int64) error
	GetPoems(ctx context.Context, collectionID int64) ([]domain.Poem, error)
	Delete(ctx context.Context, id int64) error
}
