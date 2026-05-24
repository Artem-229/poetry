package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"poetry/backend/internal/domain"
	"poetry/backend/internal/usecase"
)

type InteractionHandler struct {
	uc *usecase.InteractionUsecase
}

func NewInteractionHandler(uc *usecase.InteractionUsecase) *InteractionHandler {
	return &InteractionHandler{uc: uc}
}

func (h *InteractionHandler) AddLike(c *gin.Context) {
	var req struct {
		PoemID int64 `json:"poem_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.AddLike(c.Request.Context(), c.GetInt64("user_id"), req.PoemID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *InteractionHandler) RemoveLike(c *gin.Context) {
	var req struct {
		PoemID int64 `json:"poem_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.RemoveLike(c.Request.Context(), c.GetInt64("user_id"), req.PoemID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *InteractionHandler) AddFavorite(c *gin.Context) {
	var req struct {
		PoemID int64 `json:"poem_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.AddFavorite(c.Request.Context(), c.GetInt64("user_id"), req.PoemID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *InteractionHandler) RemoveFavorite(c *gin.Context) {
	var req struct {
		PoemID int64 `json:"poem_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.uc.RemoveFavorite(c.Request.Context(), c.GetInt64("user_id"), req.PoemID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *InteractionHandler) GetUserFavorites(c *gin.Context) {
	poems, err := h.uc.GetUserFavorites(c.Request.Context(), c.GetInt64("user_id"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if poems == nil {
		poems = []domain.Poem{}
	}
	c.JSON(http.StatusOK, poems)
}

func (h *InteractionHandler) GetPoemStatus(c *gin.Context) {
	poemID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	liked, favorited, err := h.uc.GetPoemStatus(c.Request.Context(), c.GetInt64("user_id"), poemID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"liked": liked, "favorited": favorited})
}
