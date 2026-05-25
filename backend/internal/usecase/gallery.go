package usecase

import (
	"context"

	"poetry/backend/internal/domain"
)

type GalleryRepository interface {
	List(ctx context.Context) ([]domain.GalleryItem, error)
	Create(ctx context.Context, imageURL, caption string, sortOrder int) (domain.GalleryItem, error)
	GetByID(ctx context.Context, id int64) (domain.GalleryItem, error)
	Update(ctx context.Context, id int64, caption string, sortOrder int) error
	Delete(ctx context.Context, id int64) error
	Reorder(ctx context.Context, items []domain.GalleryReorderItem) error
}

type GalleryUsecase struct {
	repo GalleryRepository
}

func NewGalleryUsecase(r GalleryRepository) *GalleryUsecase {
	return &GalleryUsecase{repo: r}
}

func (u *GalleryUsecase) List(ctx context.Context) ([]domain.GalleryItem, error) {
	items, err := u.repo.List(ctx)
	if items == nil {
		items = []domain.GalleryItem{}
	}
	return items, err
}

func (u *GalleryUsecase) Create(ctx context.Context, imageURL, caption string, sortOrder int) (domain.GalleryItem, error) {
	return u.repo.Create(ctx, imageURL, caption, sortOrder)
}

func (u *GalleryUsecase) GetByID(ctx context.Context, id int64) (domain.GalleryItem, error) {
	return u.repo.GetByID(ctx, id)
}

func (u *GalleryUsecase) Update(ctx context.Context, id int64, caption string, sortOrder int) error {
	return u.repo.Update(ctx, id, caption, sortOrder)
}

func (u *GalleryUsecase) Delete(ctx context.Context, id int64) error {
	return u.repo.Delete(ctx, id)
}

func (u *GalleryUsecase) Reorder(ctx context.Context, items []domain.GalleryReorderItem) error {
	return u.repo.Reorder(ctx, items)
}
