FROM golang:1.25-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
COPY adapters/postgres/go.mod adapters/postgres/go.sum ./adapters/postgres/
COPY demo/server/go.mod demo/server/go.sum ./demo/server/

WORKDIR /src/demo/server
RUN go mod download

WORKDIR /src
COPY auth.go auth_test.go doc.go handlers.go handlers_test.go middleware.go type.go ./
COPY adapters/postgres ./adapters/postgres
COPY demo/server ./demo/server

WORKDIR /src/demo/server
RUN CGO_ENABLED=0 GOOS=linux go build -tags netgo -ldflags="-s -w" -o /out/authingo-demo-server .

FROM alpine:3.22

RUN addgroup -S authingo && adduser -S authingo -G authingo

WORKDIR /app

COPY --from=builder /out/authingo-demo-server /app/authingo-demo-server

EXPOSE 8080

USER authingo

CMD ["/app/authingo-demo-server"]
