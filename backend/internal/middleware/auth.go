package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"poetry/backend/internal/service"
)

func Auth(jwtSvc *service.JWTService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "missing token",
			})
			return
		}

		// ожидаем: "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid token format",
			})
			return
		}

		token := parts[1]

		userID, role, err := jwtSvc.Parse(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid token",
			})
			return
		}

		c.Set("user_id", userID)
		c.Set("role", role)

		c.Next()
	}
}
