package usecase

import (
	"context"

	"poetry/backend/internal/domain"
)

type CommentRepository interface {
	Create(ctx context.Context, c *domain.Comment) error
	Delete(ctx context.Context, id int64, poemID int64) error
}

type CommentUsecase struct {
	repo CommentRepository
}

func NewCommentUsecase(r CommentRepository) *CommentUsecase {
	return &CommentUsecase{repo: r}
}

func (u *CommentUsecase) Create(ctx context.Context, c *domain.Comment) error {
	return u.repo.Create(ctx, c)
}

func (u *CommentUsecase) Delete(ctx context.Context, id int64, poemID int64) error {
	return u.repo.Delete(ctx, id, poemID)
}
