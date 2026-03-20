# Core Concepts

AuthInGo is designed to be incredibly lightweight and framework-agnostic. To use it effectively, you only need to understand two main concepts: **The Hub** and **The Store Interface**.

## The Hub (`authingo.New`)

Everything revolves around the central `Auth` instance. You initialize it once in your `main.go` file by passing in your configuration options. 

AuthInGo does not force you to use a specific web framework like Gin or Echo. Instead, the Hub exposes a `.Handler()` method that returns a standard Go `http.Handler`. 

```go
package main

import (
	"net/http"
	"https://github.com/binit2-1/authingo"
	"https://github.com/binit2-1/authingo/adapters/postgres"
)

func main() {
	// 1. Initialize the Hub
	auth := authingo.New(authingo.Options{
		Store: postgres.NewAdapter(dbConn), // Your database
	})

	// 2. Mount to the standard Go router
	mux := http.NewServeMux()
	mux.Handle("/api/auth/", http.StripPrefix("/api/auth", auth.Handler()))
	
	http.ListenAndServe(":8080", mux)
}
```
By mounting this handler, AuthInGo automatically registers the highly-optimized JSON endpoints that your Next.js or React frontend will communicate with (e.g., /sign-up, /sign-in, /session).
The Store Interface (Database Agnosticism)

AuthInGo does not care where your data lives, as long as your database adapter implements the authingo.Store interface.

Because the data lives directly in your database, you maintain 100% data ownership. You can write native SQL queries joining your application's orders or posts tables directly to the AuthInGo users table without making slow network requests to a third-party auth provider.


---

### API Design: The PostgreSQL Adapter Usage

Now we move to the next step in our loop: **API Design for the Postgres Adapter**. 

Before we write the actual SQL queries, we need to decide how the developer will initialize it.

**How it works:**
In Go, developers usually already have a database connection pool set up (a `*sql.DB` object) to run queries for their own application. 
The absolute best Developer Experience (DX) is to let them pass their existing database connection directly into our adapter. That way, AuthInGo shares the same connection pool, preventing connection leaks and saving memory.

**The Usage Draft (What the user will write):**

```go
package main

import (
	"database/sql"
	"log"

	"github.com/binit2-1/authingo"
	"github.com/binit2-1/authingo/adapters/postgres"
	
	// The standard Postgres driver for Go
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	// 1. The developer opens their own database connection
	db, err := sql.Open("pgx", "postgres://user:pass@localhost:5432/mydb?sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}

	// 2. They pass their connection directly to our adapter!
	auth := authingo.New(authingo.Options{
		Store: postgres.NewAdapter(db),
	})

	// ... mount and run server ...
}
```
# REST API Endpoints

AuthInGo exposes standard JSON REST endpoints. If you are using our `@authingo/react` SDK, you do not need to memorize these—the SDK handles them automatically. However, if you are building a custom client (like a mobile app), here are the core contracts.

## Authentication Routes

All routes are mounted under the prefix you specify in your Go router (e.g., `/api/auth`).

### `POST /sign-up`
Creates a new user account and immediately establishes an active session via an `HttpOnly` cookie.

**Request Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Binit Gupta"
}
```
