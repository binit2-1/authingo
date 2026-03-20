package postgres

import (
	"context"
	"database/sql"
	"os"
	"testing"
	"time"

	"github.com/binit2-1/authingo"
)

func setupTestDB(t *testing.T) *sql.DB {
	dbURL := os.Getenv("TEST_URL_DB")
	if dbURL == "" {
		t.Skip("Skipping Postgres integration test; TEST_DB_URL environment variable is not set")
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	_, err = db.Exec(`
	    TRUNCATE TABLE sessions CASCADE;
		TRUNCATE TABLE users CASCADE;
	`)

	if err != nil && err != sql.ErrNoRows {
		t.Logf("Note: Could not truncate tables (they might not exist yet): %v", err)
	}

	return db
}

// TestUserRepository tests the entire lifecycle of a User in the database.
func TestUserRepository(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	adapter := NewAdapter(db)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user := &authingo.User{
		ID:            "user_123",
		Email:         "test@example.com",
		Name:          "Binit",
		PasswordHash:  "hashed_password_abc",
		EmailVerified: true,
		CreatedAt:     time.Now().UTC(),
		UpdatedAt:     time.Now().UTC(),
	}

	err := adapter.CreateUser(ctx, user)
	if err != nil {
		t.Fatalf("Failed to create user: %v", err)
	}

	fetchedUser, err := adapter.GetUserByEmail(ctx, "test@example.com")
	if err != nil {
		t.Fatalf("Failed to get user: %v", err)
	}
	if fetchedUser == nil {
		t.Fatal("Expected user to be returned, got nil")
	}
	if fetchedUser.Name != "Binit" {
		t.Errorf("Expected name 'Binit', got '%s'", fetchedUser.Name)
	}

	notFoundUser, err := adapter.GetUserByEmail(ctx, "doesnotexist@example.com")
	if err != nil {
		t.Fatalf("Expected no error for missing user, got %v", err)
	}
	if notFoundUser != nil {
		t.Errorf("Expected nil user for missing email, got %v", notFoundUser)
	}
}

// TestSessionRepository tests creating, fetching, and deleting sessions.
func TestSessionRepository(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	adapter := NewAdapter(db)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	user := &authingo.User{
		ID:           "user_456",
		Email:        "session_test@example.com",
		Name:         "Session Tester",
		PasswordHash: "hash",
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}
	_ = adapter.CreateUser(ctx, user)

	session := &authingo.Session{
		ID:        "session_123",
		UserID:    user.ID,
		Token:     "secure_random_token_xyz",
		ExpiresAt: time.Now().Add(24 * time.Hour).UTC(),
		CreatedAt: time.Now().UTC(),
	}

	err := adapter.CreateSession(ctx, session)
	if err != nil {
		t.Fatalf("Failed to create session: %v", err)
	}

	fetchedSession, fetchedUser, err := adapter.GetSession(ctx, "secure_random_token_xyz")
	if err != nil {
		t.Fatalf("Failed to get session: %v", err)
	}
	if fetchedSession == nil || fetchedUser == nil {
		t.Fatal("Expected session and user to be returned, got nil")
	}
	if fetchedUser.Email != "session_test@example.com" {
		t.Errorf("Expected joined user email to be 'session_test@example.com', got '%s'", fetchedUser.Email)
	}

	err = adapter.DeleteSession(ctx, "secure_random_token_xyz")
	if err != nil {
		t.Fatalf("Failed to delete session: %v", err)
	}

	// Verify deletion
	deletedSession, _, _ := adapter.GetSession(ctx, "secure_random_token_xyz")
	if deletedSession != nil {
		t.Error("Expected session to be deleted, but it was still found")
	}
}
