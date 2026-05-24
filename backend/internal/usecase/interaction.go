package usecase

import (
	"context"

	"poetry/backend/internal/domain"
)

type InteractionRepository interface {
	AddLike(ctx context.Context, userID, poemID int64) error
	RemoveLike(ctx context.Context, userID, poemID int64) error
	AddFavorite(ctx context.Context, userID, poemID int64) error
	RemoveFavorite(ctx context.Context, userID, poemID int64) error
	GetUserFavorites(ctx context.Context, userID int64) ([]domain.Poem, error)
	CheckLike(ctx context.Context, userID, poemID int64) (bool, error)
	CheckFavorite(ctx context.Context, userID, poemID int64) (bool, error)
}

type InteractionUsecase struct {
	repo InteractionRepository
}

func NewInteractionUsecase(r InteractionRepository) *InteractionUsecase {
	return &InteractionUsecase{repo: r}
}

func (u *InteractionUsecase) AddLike(ctx context.Context, userID, poemID int64) error {
	return u.repo.AddLike(ctx, userID, poemID)
}

func (u *InteractionUsecase) RemoveLike(ctx context.Context, userID, poemID int64) error {
	return u.repo.RemoveLike(ctx, userID, poemID)
}

func (u *InteractionUsecase) AddFavorite(ctx context.Context, userID, poemID int64) error {
	return u.repo.AddFavorite(ctx, userID, poemID)
}

func (u *InteractionUsecase) RemoveFavorite(ctx context.Context, userID, poemID int64) error {
	return u.repo.RemoveFavorite(ctx, userID, poemID)
}

func (u *InteractionUsecase) GetUserFavorites(ctx context.Context, userID int64) ([]domain.Poem, error) {
	return u.repo.GetUserFavorites(ctx, userID)
}

func (u *InteractionUsecase) GetPoemStatus(ctx context.Context, userID, poemID int64) (liked bool, favorited bool, err error) {
	liked, err = u.repo.CheckLike(ctx, userID, poemID)
	if err != nil {
		return
	}
	favorited, err = u.repo.CheckFavorite(ctx, userID, poemID)
	return
}
