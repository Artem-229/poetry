package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"poetry/backend/internal/domain"
	"poetry/backend/internal/usecase"
)

type SiteContentHandler struct {
	uc *usecase.SiteContentUsecase
}

func NewSiteContentHandler(uc *usecase.SiteContentUsecase) *SiteContentHandler {
	return &SiteContentHandler{uc: uc}
}

func (h *SiteContentHandler) Get(c *gin.Context) {
	data, err := h.uc.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, data)
}

func (h *SiteContentHandler) Update(c *gin.Context) {
	var req map[string]string
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := c.GetString("role")
	if err := h.uc.Set(c.Request.Context(), req, domain.Role(role)); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}
