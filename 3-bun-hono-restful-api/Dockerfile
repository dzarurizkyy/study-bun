FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY hono-restful-api ./hono-restful-api

RUN chmod +x ./hono-restful-api

EXPOSE 3000

CMD ["./hono-restful-api"]
