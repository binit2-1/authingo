package authingo

import (
	"context"
	"net/http"
	"time"
)

type ContextKey string

const (
	UserContextKey ContextKey = "user"
)

// RequireAuth is a middleware that protects routes from CSRF and unauthorized access.
func (a *Auth) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !hasClientHeader(r) {
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
			a.clearSessionCookie(w)
			http.Error(w, "Unauthorized: Invalid or expired session", http.StatusUnauthorized)
			return
		}
		if user == nil || session.ExpiresAt.Before(time.Now()) || session.RefreshExpiresAt.Before(time.Now()) {
			a.clearSessionCookie(w)
			http.Error(w, "Unauthorized: Invalid or expired session", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
