# ── Stage 1: Build ───────────────────────────────────────────
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY backend/ ./backend/

RUN CGO_ENABLED=0 GOOS=linux go build -o app ./backend/cmd/main.go

# ── Stage 2: Run ─────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

# ca-certificates нужны если бекенд будет делать HTTPS запросы
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/app .

EXPOSE 8080

CMD ["./app"]
