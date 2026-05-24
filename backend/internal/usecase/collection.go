package usecase

import (
	"context"
	"errors"

	"poetry/backend/internal/domain"
)

type CollectionRepo interface {
	Create(ctx context.Context, c *domain.Collection) error
	GetByID(ctx context.Context, id int64) (*domain.Collection, error)
	List(ctx context.Context) ([]domain.Collection, error)
	AddPoem(ctx context.Context, collectionID, poemID int64) error
	RemovePoem(ctx context.Context, collectionID, poemID int64) error
	GetPoems(ctx context.Context, collectionID int64) ([]domain.Poem, error)
	Delete(ctx context.Context, id int64) error
}

type CollectionUsecase struct {
	repo CollectionRepo
}

func NewCollectionUsecase(r CollectionRepo) *CollectionUsecase {
	return &CollectionUsecase{repo: r}
}

func (u *CollectionUsecase) List(ctx context.Context) ([]domain.Collection, error) {
	return u.repo.List(ctx)
}

func (u *CollectionUsecase) GetByID(ctx context.Context, id int64) (*domain.Collection, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *CollectionUsecase) GetPoems(ctx context.Context, id int64) ([]domain.Poem, error) {
	return u.repo.GetPoems(ctx, id)
}

func (u *CollectionUsecase) Create(ctx context.Context, c *domain.Collection, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.Create(ctx, c)
}

func (u *CollectionUsecase) AddPoem(ctx context.Context, collectionID, poemID int64, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.AddPoem(ctx, collectionID, poemID)
}

func (u *CollectionUsecase) RemovePoem(ctx context.Context, collectionID, poemID int64, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.RemovePoem(ctx, collectionID, poemID)
}

func (u *CollectionUsecase) Delete(ctx context.Context, id int64, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.Delete(ctx, id)
}
