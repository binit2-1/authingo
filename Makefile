fmt:
	@go fmt ./...

test: 
	@go test -v ./...

db-it:
	@docker exec -it authingo-postgres psql -U postgres-healthcheck -d postgres-healthcheck