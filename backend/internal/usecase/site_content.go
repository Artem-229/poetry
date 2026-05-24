package usecase

import (
	"context"
	"errors"

	"poetry/backend/internal/domain"
)

type SiteContentRepository interface {
	GetAll(ctx context.Context) (map[string]string, error)
	Set(ctx context.Context, data map[string]string) error
}

type SiteContentUsecase struct {
	repo SiteContentRepository
}

func NewSiteContentUsecase(r SiteContentRepository) *SiteContentUsecase {
	return &SiteContentUsecase{repo: r}
}

func (u *SiteContentUsecase) GetAll(ctx context.Context) (map[string]string, error) {
	return u.repo.GetAll(ctx)
}

func (u *SiteContentUsecase) Set(ctx context.Context, data map[string]string, role domain.Role) error {
	if role != domain.RoleAdmin {
		return errors.New("forbidden")
	}
	return u.repo.Set(ctx, data)
}
