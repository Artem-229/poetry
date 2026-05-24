package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"poetry/backend/internal/domain"
	"poetry/backend/internal/usecase"
)

type PoemHandler struct {
	uc *usecase.PoemUsecase
}

func NewPoemHandler(uc *usecase.PoemUsecase) *PoemHandler {
	return &PoemHandler{uc: uc}
}

func (h *PoemHandler) List(c *gin.Context) {
	sort := c.Query("sort")

	poems, err := h.uc.List(c.Request.Context(), 20, 0, sort)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, poems)
}

func (h *PoemHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseInt(idStr, 10, 64)

	poem, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.JSON(http.StatusOK, poem)
}

func (h *PoemHandler) Create(c *gin.Context) {
	var req struct {
		Title       string     `json:"title"`
		Content     string     `json:"content"`
		Genre       *string    `json:"genre"`
		WrittenAt   *time.Time `json:"written_at"`
		PublishedAt *time.Time `json:"published_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := c.GetString("role")
	userID := c.GetInt64("user_id")

	poem := &domain.Poem{
		Title:    req.Title,
		Content:  req.Content,
		AuthorID: userID,
		Genre:    req.Genre,
		WrittenAt: req.WrittenAt,
	}
	if req.PublishedAt != nil {
		poem.PublishedAt = *req.PublishedAt
	}

	err := h.uc.Create(c.Request.Context(), poem, domain.Role(role))
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, poem)
}

func (h *PoemHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseInt(idStr, 10, 64)

	role := c.GetString("role")

	err := h.uc.Delete(c.Request.Context(), id, domain.Role(role))
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *PoemHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req struct {
		Title       string     `json:"title"`
		Content     string     `json:"content"`
		Genre       *string    `json:"genre"`
		WrittenAt   *time.Time `json:"written_at"`
		PublishedAt *time.Time `json:"published_at"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := c.GetString("role")

	poem := &domain.Poem{
		ID:        id,
		Title:     req.Title,
		Content:   req.Content,
		Genre:     req.Genre,
		WrittenAt: req.WrittenAt,
	}
	if req.PublishedAt != nil {
		poem.PublishedAt = *req.PublishedAt
	}

	err = h.uc.Update(c.Request.Context(), poem, domain.Role(role))
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
