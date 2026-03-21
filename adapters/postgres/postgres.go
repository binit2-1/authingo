package postgres

import (
	"context"
	"database/sql"
	"errors"

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
		INSERT INTO sessions(id, user_id, token, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := a.db.ExecContext(ctx, query,
		session.ID,
		session.UserID,
		session.Token,
		session.CreatedAt,
		session.ExpiresAt,
	)
	return err
}

// GetSession retrieves a session and its associated user via a SQL JOIN.
func (a *Adapter) GetSession(ctx context.Context, token string) (*authingo.Session, *authingo.User, error) {
	session := &authingo.Session{}
	user := &authingo.User{}

	query := `
		SELECT s.id, s.user_id, s.token, s.expires_at, s.created_at, 
		       u.id, u.email, u.name, u.password_hash, u.email_verified, u.created_at, u.updated_at
		FROM sessions s
		JOIN users u ON s.user_id = u.id
		WHERE s.token = $1
	`

	err := a.db.QueryRowContext(ctx, query, token).Scan(
		// Session fields
		&session.ID, &session.UserID, &session.Token, &session.ExpiresAt, &session.CreatedAt,
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

// DeleteSession removes a session from the database (used for logout).
func (a *Adapter) DeleteSession(ctx context.Context, token string) error {
	query := `DELETE FROM sessions WHERE token = $1`
	_, err := a.db.ExecContext(ctx, query, token)
	return err
}
