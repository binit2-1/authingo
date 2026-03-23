package authingo

import (
	"context"
	"net/http"
)



type ContextKey string

const (
	UserContextKey ContextKey = "user"
)

// RequireAuth is a middleware that protects routes from CSRF and unauthorized access.
func(a *Auth) RequireAuth(next http.Handler) http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Authingo-Client") != "true" {
			http.Error(w, "Forbidden: Missing Anti-CSRF header", http.StatusForbidden)
			return 
		}

		cookie, err := r.Cookie("authingo_session")
		if err != nil || cookie.Value == "" {
			http.Error(w, "Unauthorized: No session cookie", http.StatusUnauthorized)
			return
		}

		session, user, err := a.store.GetSession(r.Context(), cookie.Value)
		if err != nil || session == nil {
			http.SetCookie(w, &http.Cookie{
				Name: "authingo_session",
				Value: "",
				Path: "/",
				MaxAge: -1,
				HttpOnly: true,
			})
			http.Error(w, "Unauthorized: Invalid or expired session", http.StatusUnauthorized)
			return 
		}

		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}