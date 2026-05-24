#!/bin/sh
set -e
migrate -path /migrations -database "$DB_URL" up
exec ./app
