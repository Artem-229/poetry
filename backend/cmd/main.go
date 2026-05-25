package main

import (
	"context"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"poetry/backend/config"
	"poetry/backend/internal/delivery/http"
	"poetry/backend/internal/repository/postgres"
	"poetry/backend/internal/service"
	"poetry/backend/internal/usecase"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()

	dbpool, err := pgxpool.New(ctx, cfg.DBUrl)
	if err != nil {
		log.Fatalf("db connection error: %v", err)
	}
	defer dbpool.Close()

	jwtSvc := service.NewJWTService(cfg.JWTSecret, time.Hour*24)
	pwdSvc := service.NewPasswordService()

	userRepo := postgres.NewUserRepo(dbpool)
	poemRepo := postgres.NewPoemRepo(dbpool)
	commentRepo := postgres.NewCommentRepo(dbpool)
	interactionRepo := postgres.NewInteractionRepo(dbpool)
	collectionRepo := postgres.NewCollectionRepo(dbpool)
	siteContentRepo := postgres.NewSiteContentRepo(dbpool)
	galleryRepo := postgres.NewGalleryRepo(dbpool)

	authUC := usecase.NewAuthUsecase(userRepo, jwtSvc, pwdSvc)
	poemUC := usecase.NewPoemUsecase(poemRepo)
	interactionUC := usecase.NewInteractionUsecase(interactionRepo)
	commentUC := usecase.NewCommentUsecase(commentRepo)
	collectionUC := usecase.NewCollectionUsecase(collectionRepo)
	siteContentUC := usecase.NewSiteContentUsecase(siteContentRepo)
	galleryUC := usecase.NewGalleryUsecase(galleryRepo)

	r := http.NewRouter(authUC, poemUC, interactionUC, commentUC, collectionUC, siteContentUC, galleryUC, jwtSvc)

	log.Println("server started on :" + cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
