package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetInt64("user_id")

	err := h.uc.AddLike(c.Request.Context(), userID, req.PoemID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *InteractionHandler) RemoveLike(c *gin.Context) {
	var req struct {
		PoemID int64 `json:"poem_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetInt64("user_id")

	err := h.uc.RemoveLike(c.Request.Context(), userID, req.PoemID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
