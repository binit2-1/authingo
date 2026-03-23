package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/binit2-1/authingo"
	"github.com/binit2-1/authingo/adapters/postgres"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Authingo-Client") 
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Connect to your Postgres database
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	
	db, err := sql.Open("pgx", os.Getenv("TEST_URL_DB"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	auth := authingo.New(authingo.Options{
		Store: postgres.NewAdapter(db),
	})

	mux := http.NewServeMux()
	mux.Handle("/api/auth/", http.StripPrefix("/api/auth", auth.Handler()))

	handlerWithCORS := corsMiddleware(mux)

	log.Println("Go Backend running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handlerWithCORS))
}
