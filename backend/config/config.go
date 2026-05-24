package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBUrl     string
	JWTSecret string
	Port      string
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		DBUrl:     os.Getenv("DB_URL"),
		JWTSecret: os.Getenv("JWT_SECRET"),
		Port:      os.Getenv("PORT"),
	}

	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	if cfg.DBUrl == "" {
		log.Fatal("DB_URL is required")
	}

	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	return cfg
}
