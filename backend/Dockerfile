# ── Stage 1: Build ───────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY backend/ ./backend/

RUN CGO_ENABLED=0 GOOS=linux go build -o app ./backend/cmd/main.go

# ── Stage 2: Migrate binary ───────────────────────────────────
FROM migrate/migrate:v4.17.0 AS migrate

# ── Stage 3: Run ─────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

RUN apk add --no-cache ca-certificates

COPY --from=migrate /migrate /usr/local/bin/migrate
COPY --from=builder /app/app .
COPY backend/migrations /migrations

EXPOSE 8080

CMD ["sh", "-c", "migrate -path /migrations -database \"${DB_URL}\" up && exec ./app"]
