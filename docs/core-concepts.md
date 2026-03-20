# Core Concepts

AuthInGo is designed to be incredibly lightweight and framework-agnostic. To use it effectively, you only need to understand two main concepts: **The Hub** and **The Store Interface**.

## The Hub (`authingo.New`)

Everything revolves around the central `Auth` instance. You initialize it once in your `main.go` file by passing in your configuration options. 

AuthInGo does not force you to use a specific web framework like Gin or Echo. Instead, the Hub exposes a `.Handler()` method that returns a standard Go `http.Handler`. 

```go
package main

import (
	"net/http"
	"[github.com/binit2-1/authingo](https://github.com/binit2-1/authingo)"
	"[github.com/binit2-1/authingo/adapters/postgres](https://github.com/binit2-1/authingo/adapters/postgres)"
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
