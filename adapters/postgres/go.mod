module github.com/binit2-1/authingo/adapters/postgres

go 1.25.7

require (
	github.com/binit2-1/authingo v0.0.0-00010101000000-000000000000
	github.com/jackc/pgx/v5 v5.9.1
)

require (
	github.com/jackc/pgpassfile v1.0.0 // indirect
	github.com/jackc/pgservicefile v0.0.0-20240606120523-5a60cdf6a761 // indirect
	github.com/jackc/puddle/v2 v2.2.2 // indirect
	golang.org/x/crypto v0.49.0 // indirect
	golang.org/x/sync v0.20.0 // indirect
	golang.org/x/text v0.35.0 // indirect
)

replace github.com/binit2-1/authingo => ../../

replace github.com/binit2-1/authingo/adapters/postgres => ../adapters/postgres
