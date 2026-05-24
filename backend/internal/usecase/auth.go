package usecase

import (
	"context"
	"errors"

	"poetry/backend/internal/domain"
	"poetry/backend/internal/service"
)

type UserRepository interface {
	Create(ctx context.Context, user *domain.User) error
	GetByEmail(ctx context.Context, email string) (*domain.User, error)
}

type AuthUsecase struct {
	userRepo UserRepository
	jwtSvc   *service.JWTService
	pwdSvc   *service.PasswordService
}

func NewAuthUsecase(r UserRepository, j *service.JWTService, p *service.PasswordService) *AuthUsecase {
	return &AuthUsecase{userRepo: r, jwtSvc: j, pwdSvc: p}
}

func (u *AuthUsecase) Register(ctx context.Context, email, password string) error {
	hash, err := u.pwdSvc.Hash(password)
	if err != nil {
		return err
	}

	return u.userRepo.Create(ctx, &domain.User{
		Email:        email,
		PasswordHash: hash,
		Role:         domain.RoleUser,
	})
}

func (u *AuthUsecase) Login(ctx context.Context, email, password string) (*domain.User, string, error) {
	user, err := u.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, "", errors.New("неверный email или пароль")
	}

	if err := u.pwdSvc.Compare(user.PasswordHash, password); err != nil {
		return nil, "", errors.New("неверный email или пароль")
	}

	token, err := u.jwtSvc.Generate(user.ID, string(user.Role))
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}
