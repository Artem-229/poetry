package http

import (
	"github.com/gin-gonic/gin"

	handler "poetry/backend/internal/delivery/http/handlers"
	"poetry/backend/internal/middleware"
	"poetry/backend/internal/service"
	"poetry/backend/internal/usecase"
)

func NewRouter(
	authUC *usecase.AuthUsecase,
	poemUC *usecase.PoemUsecase,
	interactionUC *usecase.InteractionUsecase,
	commentUC *usecase.CommentUsecase,
	collectionUC *usecase.CollectionUsecase,
	siteContentUC *usecase.SiteContentUsecase,
	jwtSvc *service.JWTService,
) *gin.Engine {

	r := gin.Default()
	r.Use(middleware.CORS())

	authH := handler.NewAuthHandler(authUC)
	poemH := handler.NewPoemHandler(poemUC)
	interH := handler.NewInteractionHandler(interactionUC)
	commentH := handler.NewCommentHandler(commentUC)
	collH := handler.NewCollectionHandler(collectionUC)
	siteH := handler.NewSiteContentHandler(siteContentUC)

	// Auth routes
	auth := r.Group("/auth")
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.GET("/me", middleware.Auth(jwtSvc), authH.Me)
	}

	// Public routes
	r.GET("/site-content", siteH.Get)
	r.GET("/poems", poemH.List)
	r.GET("/poems/:id", poemH.Get)
	r.GET("/poems/:id/comments", commentH.ListByPoem)
	r.GET("/collections", collH.List)
	r.GET("/collections/:id", collH.Get)

	// Authenticated routes
	api := r.Group("/")
	api.Use(middleware.Auth(jwtSvc))
	{
		api.POST("/likes", interH.AddLike)
		api.DELETE("/likes", interH.RemoveLike)
		api.POST("/favorites", interH.AddFavorite)
		api.DELETE("/favorites", interH.RemoveFavorite)
		api.GET("/users/me/favorites", interH.GetUserFavorites)
		api.GET("/poems/:id/status", interH.GetPoemStatus)

		api.POST("/comments", commentH.Create)
		api.DELETE("/comments/:id", commentH.Delete)
	}

	// Admin-only routes
	admin := r.Group("/")
	admin.Use(middleware.Auth(jwtSvc), middleware.AdminOnly())
	{
		admin.POST("/poems", poemH.Create)
		admin.PUT("/poems/:id", poemH.Update)
		admin.DELETE("/poems/:id", poemH.Delete)

		admin.POST("/collections", collH.Create)
		admin.POST("/collections/:id/poems", collH.AddPoem)
		admin.DELETE("/collections/:id/poems", collH.RemovePoem)
		admin.DELETE("/collections/:id", collH.Delete)

		admin.PUT("/site-content", siteH.Update)
	}

	return r
}
