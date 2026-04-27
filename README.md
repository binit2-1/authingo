# AuthInGo 🔐

A lightweight, developer-first authentication library for Go and React. Build secure, cookie-based auth in minutes without the bloat of a full identity provider.

## Features
- **Go Core**: Opaque token session management for high security.
- **Refresh Token Rotation**: Built-in silent refreshing (15-min access / 30-day refresh) to prevent session hijacking without interrupting the user.
- **Postgres Adapter**: Isolated, built-in support for scalable data storage.
- **React SDK**: Global ```<AuthProvider>``` with smart request queueing to prevent "Thundering Herd" API failures.
- **Security First**: HttpOnly, Secure, and SameSite cookie defaults.

---

##  Quick Start (Go Backend)

```bash
go get github.com/binit2-1/authingo
go get github.com/binit2-1/authingo/adapters/postgres
```


```go
package main

import (
    "database/sql"
    "net/http"

    "github.com/binit2-1/authingo"
    "github.com/binit2-1/authingo/adapters/postgres"
    _ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
    db, _ := sql.Open("pgx", "postgres://user:pass@localhost:5432/mydb")
    
    auth := authingo.New(authingo.Options{
        Store: postgres.NewAdapter(db),
    })

    mux := http.NewServeMux()

    // 1. Mount the core authentication endpoints (/sign-in, /sign-up, /refresh, etc.)
    mux.Handle("/api/auth/", http.StripPrefix("/api/auth", auth.Handler()))

    // 2. Protect your custom routes with built-in middleware
    mux.Handle("/api/protected", auth.RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Only logged-in users can see this!"))
    })))

    http.ListenAndServe(":8080", mux)
}
```

## Quick Start (React Frontend)

```bash
npm install @authingo/react
```

# 1. Wrap your application in the Provider

Provide global state and enable the silent refresh interceptor by wrapping your app (e.g., in Next.js ```layout.tsx``` or React ```App.tsx```).

```tsx
import { AuthProvider } from "@authingo/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider baseURL="http://localhost:8080/api/auth">
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

# 2. Read state and trigger actions

Use the ```useAuth()``` hook to read the global state, and the ```createAuthClient``` to trigger server actions.

```tsx 
"use client";

import { useAuth, createAuthClient } from "@authingo/react";

// Initialize the action client
const authClient = createAuthClient({ baseURL: "http://localhost:8080/api/auth" });

export default function Dashboard() {
  const { user, isLoading, checkSession, logout } = useAuth();

  if (isLoading) return <p>Loading session...</p>;

  if (!user) {
    return (
      <button onClick={async () => {
        await authClient.signIn.email({ email: "test@example.com", password: "password123" });
        await checkSession(); // Force the global provider to update the UI
      }}>
        Sign In
      </button>
    );
  }

  return (
    <div>
      <h1>Welcome back, {user.name}!</h1>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```