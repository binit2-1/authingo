package postgres

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"time"

	"github.com/binit2-1/authingo"
)

type Adapter struct {
	db *sql.DB
}

func NewAdapter(db *sql.DB) *Adapter {
	return &Adapter{
		db: db,
	}
}

// CreateUser inserts a new user record into the database.
func (a *Adapter) CreateUser(ctx context.Context, user *authingo.User) error {
	query := `
	        INSERT INTO users(id, email, name, password_hash, email_verified, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)	
	`
	_, err := a.db.ExecContext(ctx, query,
		user.ID,
		user.Email,
		user.Name,
		user.PasswordHash,
		user.EmailVerified,
		user.CreatedAt,
		user.UpdatedAt,
	)
	return err
}

// GetUserByEmail retrieves a user by their email address.
func (a *Adapter) GetUserByEmail(ctx context.Context, email string) (*authingo.User, error) {
	query := `
		SELECT id, email, name, password_hash, email_verified, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user authingo.User
	err := a.db.QueryRowContext(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.PasswordHash,
		&user.EmailVerified,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

// CreateSession stores a new login session token in the database.
func (a *Adapter) CreateSession(ctx context.Context, session *authingo.Session) error {
	query := `
		INSERT INTO sessions(id, user_id, token, refresh_token, created_at, refresh_expires_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := a.db.ExecContext(ctx, query,
		session.ID,
		session.UserID,
		session.Token,
		session.RefreshToken,
		session.CreatedAt,
		session.RefreshExpiresAt,
		session.ExpiresAt,
	)
	return err
}

// GetSession retrieves a session and its associated user via a SQL JOIN.
func (a *Adapter) GetSession(ctx context.Context, token string) (*authingo.Session, *authingo.User, error) {
	session := &authingo.Session{}
	user := &authingo.User{}

	query := `
		SELECT s.id, s.user_id, s.token, s.refresh_token, s.expires_at, s.created_at, s.refresh_expires_at,
		       u.id, u.email, u.name, u.password_hash, u.email_verified, u.created_at, u.updated_at
		FROM sessions s
		JOIN users u ON s.user_id = u.id
		WHERE s.token = $1
	`

	err := a.db.QueryRowContext(ctx, query, token).Scan(
		// Session fields
		&session.ID, &session.UserID, &session.Token, &session.RefreshToken, &session.ExpiresAt, &session.CreatedAt, &session.RefreshExpiresAt,
		// User fields
		&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil, nil
		}
		return nil, nil, err
	}

	return session, user, nil
}

// RefreshSession updates the session's expiration time (used for "remember me" functionality).
func (a *Adapter) RefreshSession(ctx context.Context, oldToken string) (*authingo.Session, *authingo.User, error) {
	newAccessToken := generateToken(32)
	newRefreshToken := generateToken(64)

	newAccessExpiry := time.Now().Add(15 * time.Minute)
	newRefreshExpiry := time.Now().Add(30 * 24 * time.Hour)

	query := `
		UPDATE sessions 
		SET id = $1, token = $2, expires_at = $3, refresh_expires_at = $4
		WHERE token = $5 AND refresh_expires_at > NOW()
		RETURNING id, user_id, token, refresh_token, expires_at, refresh_expires_at
	`
	session:= &authingo.Session{}

	err := a.db.QueryRowContext(ctx, query, newAccessToken, newRefreshToken, newAccessExpiry, newRefreshExpiry, oldToken,
		).Scan(
			&session.ID, &session.UserID, &session.Token, &session.RefreshToken, &session.ExpiresAt, &session.RefreshExpiresAt,
	)
	if err != nil {
		return nil, nil, err 
	}


	user := &authingo.User{}
	userQuery := `SELECT id, email, name FROM users WHERE id = $1`
	err = a.db.QueryRowContext(ctx, userQuery, session.UserID).Scan(&user.ID, &user.Email, &user.Name)
	if err != nil {
		return nil, nil, err
	}

	return session, user, nil
}

// DeleteSession removes a session from the database (used for logout).
func (a *Adapter) DeleteSession(ctx context.Context, token string) error {
	query := `DELETE FROM sessions WHERE token = $1`
	_, err := a.db.ExecContext(ctx, query, token)
	return err
}

// generateToken creates a secure, URL-safe random string
func generateToken(length int) string {
	b := make([]byte, length)
	rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}
