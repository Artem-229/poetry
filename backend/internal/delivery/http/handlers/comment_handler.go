package handler

import (
	"net/http"
	"strconv"

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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := &domain.Comment{
		UserID: c.GetInt64("user_id"),
		PoemID: req.PoemID,
		Text:   req.Text,
	}

	if err := h.uc.Create(c.Request.Context(), comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func (h *CommentHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.uc.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *CommentHandler) ListByPoem(c *gin.Context) {
	poemID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid poem id"})
		return
	}

	comments, err := h.uc.ListByPoem(c.Request.Context(), poemID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if comments == nil {
		comments = []domain.Comment{}
	}

	c.JSON(http.StatusOK, comments)
}
