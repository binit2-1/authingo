fmt:
	@go fmt ./...

test: 
	@go test -v ./...

db-it:
	@docker exec -it authingo-postgres-adapter psql -U authingo -d authingo_postgres_adapter
