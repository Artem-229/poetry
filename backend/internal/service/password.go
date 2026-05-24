package service

import "golang.org/x/crypto/bcrypt"

type PasswordService struct{}

func NewPasswordService() *PasswordService {
	return &PasswordService{}
}

func (s *PasswordService) Hash(p string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(p), bcrypt.DefaultCost)
	return string(b), err
}

func (s *PasswordService) Compare(hash, p string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(p))
}
