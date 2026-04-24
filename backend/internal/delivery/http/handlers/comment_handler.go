package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"poetry/backend/internal/domain"
	"poetry/backend/internal/usecase"
)

type CommentHandler struct {
	uc *usecase.CommentUsecase
}

func NewCommentHandler(uc *usecase.CommentUsecase) *CommentHandler {
	return &CommentHandler{uc: uc}
}

func (h *CommentHandler) Create(c *gin.Context) {
	var req struct {
		PoemID int64  `json:"poem_id"`
		Text   string `json:"text"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetInt64("user_id")

	comment := &domain.Comment{
		UserID: userID,
		PoemID: req.PoemID,
		Text:   req.Text,
	}

	err := h.uc.Create(c.Request.Context(), comment)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusCreated)
}
