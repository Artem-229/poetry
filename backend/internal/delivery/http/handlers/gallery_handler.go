package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"poetry/backend/internal/usecase"
)

type GalleryHandler struct {
	uc *usecase.GalleryUsecase
}

func NewGalleryHandler(uc *usecase.GalleryUsecase) *GalleryHandler {
	return &GalleryHandler{uc: uc}
}

func (h *GalleryHandler) List(c *gin.Context) {
	items, err := h.uc.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

func saveUploadedFile(c *gin.Context, field string) (string, error) {
	file, header, err := c.Request.FormFile(field)
	if err != nil {
		return "", err
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)

	if err := os.MkdirAll("./uploads", 0755); err != nil {
		return "", err
	}

	dst, err := os.Create(filepath.Join("./uploads", filename))
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}

	return "/uploads/" + filename, nil
}

// Upload handles generic file upload (used for hero photo).
func (h *GalleryHandler) Upload(c *gin.Context) {
	url, err := saveUploadedFile(c, "image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot upload: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"url": url})
}

func (h *GalleryHandler) Create(c *gin.Context) {
	imageURL, err := saveUploadedFile(c, "image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot upload: " + err.Error()})
		return
	}

	caption := c.PostForm("caption")
	sortOrder, _ := strconv.Atoi(c.PostForm("sort_order"))

	item, err := h.uc.Create(c.Request.Context(), imageURL, caption, sortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func (h *GalleryHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req struct {
		Caption   string `json:"caption"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.uc.Update(c.Request.Context(), id, req.Caption, req.SortOrder); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}

func (h *GalleryHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	item, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	if item.ImageURL != "" {
		os.Remove("." + item.ImageURL)
	}

	if err := h.uc.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
