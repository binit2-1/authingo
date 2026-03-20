package authingo

import (
	"context"
	"net/http"
	"time"
)

// User represents a registered account in the system.
type User struct {
	ID            string    `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	PasswordHash  string    `json:"-"`
	EmailVerified bool      `json:"email_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Session represents an active login instance.
type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Token     string    `json:"token"`
	CreatedAt time.Time `json:"created_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// Store defines the exact database operations required by AuthInGo.
// Any database (Postgres, MySQL, SQLite) can be used as long as it implements
// these exact methods.
type Store interface {
	// CreateUser inserts a new user into the database.
	// We pass a pointer (*User) so the adapter can populate the generated ID.
	CreateUser(ctx context.Context, user *User) error

	// GetUserByEmail fetches a user for login validation.
	GetUserByEmail(ctx context.Context, email string) (*User, error)

	// CreateSession stores a newly generated opaque token.
	CreateSession(ctx context.Context, session *Session) error

	// GetSession fetches the session and its associated user from the database.
	GetSession(ctx context.Context, token string) (*Session, *User, error)

	// DeleteSession removes the session (used for logging out).
	DeleteSession(ctx context.Context, token string) error
}

// Plugin defines an extension that can modify the core AuthInGo behavior.
type Plugin interface {
	ID() string

	// InjectRoutes allows the plugin to add custom endpoints (e.g., /api/auth/2fa)
	InjectRoutes(mux *http.ServeMux)
}
