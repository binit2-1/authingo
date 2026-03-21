# AuthInGo 🔐

A lightweight, developer-first authentication library for Go and React. Build secure, cookie-based auth in minutes without the bloat of a full identity provider.

## Features
- **Go Core**: Opaque token session management for high security.
- **Postgres Adapter**: Built-in support for scalable data storage.
- **React SDK**: Headless hooks for `useSession`, `signIn`, and `signUp`.
- **Security First**: HttpOnly, Secure, and SameSite cookie defaults.

---

##  Quick Start (Go Backend)

```bash
go get github.com/binit2-1/authingo
go get github.com/binit2-1/authingo/adapters/postgres
```


```go
import (
    "https://github.com/binit2-1/authingo"
    "https://github.com/binit2-1/authingo/adapters/postgres"
)

func main() {
    db := // your sql.DB connection
    auth := authingo.New(authingo.Options{
        Store: postgres.NewAdapter(db),
    })

    // Mount the auth handler to your mux
    http.Handle("/api/auth/", http.StripPrefix("/api/auth", auth.Handler()))
    http.ListenAndServe(":8080", nil)
}
```

## Quick Start (React Frontend)

```bash
npm install @authingo/react
```

```tsx
import { createAuthClient } from '@authingo/react';

const auth = createAuthClient({
    baseURL: 'http://localhost:8080/api/auth'
});

export default function App() {
    const { user, isLoading } = auth.useSession();

    if (isLoading) return <p>Loading...</p>;
    
    return user ? <Dashboard user={user} /> : <LoginForm />;
}
```