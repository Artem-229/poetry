package usecase

import (
	"context"
	"errors"

	"poetry/backend/internal/domain"
)

type PoemRepository interface {
	Create(ctx context.Context, poem *domain.Poem) error
	Update(ctx context.Context, poem *domain.Poem) error
	Delete(ctx context.Context, id int64) error
	GetByID(ctx context.Context, id int64) (*domain.Poem, error)
	List(ctx context.Context, limit, offset int, sort string) ([]domain.Poem, error)
}

type PoemUsecase struct {
	repo PoemRepository
}

func NewPoemUsecase(r PoemRepository) *PoemUsecase {
	return &PoemUsecase{repo: r}
}

func (u *PoemUsecase) List(ctx context.Context, limit, offset int, sort string) ([]domain.Poem, error) {
	return u.repo.List(ctx, limit, offset, sort)
}

func (u *PoemUsecase) GetByID(ctx context.Context, id int64) (*domain.Poem, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *PoemUsecase) Create(ctx context.Context, poem *domain.Poem, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.Create(ctx, poem)
}

func (u *PoemUsecase) Update(ctx context.Context, poem *domain.Poem, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.Update(ctx, poem)
}

func (u *PoemUsecase) Delete(ctx context.Context, id int64, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.Delete(ctx, id)
}
