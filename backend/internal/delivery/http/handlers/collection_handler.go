package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"poetry/backend/internal/domain"
	"poetry/backend/internal/usecase"
)

type CollectionHandler struct {
	uc *usecase.CollectionUsecase
}

func NewCollectionHandler(uc *usecase.CollectionUsecase) *CollectionHandler {
	return &CollectionHandler{uc: uc}
}

func (h *CollectionHandler) List(c *gin.Context) {
	cols, err := h.uc.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if cols == nil {
		cols = []domain.Collection{}
	}
	c.JSON(http.StatusOK, cols)
}

func (h *CollectionHandler) Get(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	col, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	poems, err := h.uc.GetPoems(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if poems == nil {
		poems = []domain.Poem{}
	}

	c.JSON(http.StatusOK, gin.H{"collection": col, "poems": poems})
}

func (h *CollectionHandler) Create(c *gin.Context) {
	var req struct {
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	col := &domain.Collection{Title: req.Title, Description: req.Description}
	if err := h.uc.Create(c.Request.Context(), col, domain.Role(c.GetString("role"))); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, col)
}

func (h *CollectionHandler) AddPoem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req struct {
		PoemID int64 `json:"poem_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.AddPoem(c.Request.Context(), id, req.PoemID, domain.Role(c.GetString("role"))); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *CollectionHandler) RemovePoem(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req struct {
		PoemID int64 `json:"poem_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.RemovePoem(c.Request.Context(), id, req.PoemID, domain.Role(c.GetString("role"))); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}

func (h *CollectionHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.uc.Delete(c.Request.Context(), id, domain.Role(c.GetString("role"))); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
