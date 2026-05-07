package authingo

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type mockAuthStore struct {
	user           *User
	session        *Session
	getUserErr     error
	sessionDeleted bool
	refreshCalled  bool
}

func (m *mockAuthStore) CreateUser(ctx context.Context, user *User) error {
	m.user = user
	return nil
}

func (m *mockAuthStore) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	if m.getUserErr != nil {
		return nil, m.getUserErr
	}
	if m.user != nil && m.user.Email == email {
		return m.user, nil
	}
	return nil, nil
}
func (m *mockAuthStore) CreateSession(ctx context.Context, session *Session) error {
	m.session = session
	return nil
}
func (m *mockAuthStore) GetSession(ctx context.Context, token string) (*Session, *User, error) {
	if m.session != nil && m.session.Token == token {
		return m.session, m.user, nil
	}
	return nil, nil, nil
}

func (m *mockAuthStore) DeleteSession(ctx context.Context, token string) error {
	m.sessionDeleted = true
	m.session = nil
	return nil
}

func (m *mockAuthStore) RefreshSession(ctx context.Context, oldToken string) (*Session, *User, error) {
	m.refreshCalled = true
	if m.session != nil && m.session.RefreshToken == oldToken {
		m.session.Token = "rotated_access_token"
		m.session.RefreshToken = "rotated_refresh_token"
		m.session.ExpiresAt = time.Now().Add(15 * time.Minute)
		m.session.RefreshExpiresAt = time.Now().Add(30 * 24 * time.Hour)
		return m.session, m.user, nil
	}
	return nil, nil, http.ErrNoCookie
}

func (m *mockAuthStore) CleanupExpiredSessions(ctx context.Context) error {
	return nil
}

func TestHandleSignUp_Success(t *testing.T) {
	store := &mockAuthStore{}
	auth := New(Options{Store: store})

	payload := signUpRequest{
		Email:    "binit@example.com",
		Password: "supersecretpassword",
		Name:     "Binit Gupta",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/sign-up", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Authingo-Client", "true")

	rr := httptest.NewRecorder()

	auth.handleSignUp(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status 200 OK, got %v", status)
	}

	if store.user == nil {
		t.Fatal("Expected user to be saved to the database, but it was not")
	}

	if store.user.PasswordHash == "supersecretpassword" {
		t.Errorf("Password was stored in plain text!")
	}

	err := bcrypt.CompareHashAndPassword([]byte(store.user.PasswordHash), []byte("supersecretpassword"))
	if err != nil {
		t.Errorf("Stored hash is invalid or doesn't match the password: %v", err)
	}

	cookies := rr.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatal("Expected an authingo_session cookie to be set, found none")
	}
	sessionCookie := cookies[0]
	if sessionCookie.Name != "authingo_session" {
		t.Errorf("Expected cookie name 'authingo_session', got %s", sessionCookie.Name)
	}
	if !sessionCookie.HttpOnly {
		t.Error("Expected cookie to be HttpOnly for XSS protection")
	}

	// Check that the returned JSON does NOT contain the password hash
	responseBody := rr.Body.String()
	if strings.Contains(responseBody, "supersecretpassword") || strings.Contains(responseBody, store.user.PasswordHash) {
		t.Errorf("SECURITY FLAW: Password or hash was leaked in the JSON response: %s", responseBody)
	}
}

func TestHandleSignUp_MissingFields(t *testing.T) {
	auth := New(Options{Store: &mockAuthStore{}})

	// Payload missing the email and name
	payload := signUpRequest{Password: "password123"}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/sign-up", bytes.NewReader(body))
	req.Header.Set("X-Authingo-Client", "true")
	rr := httptest.NewRecorder()

	auth.handleSignUp(rr, req)

	// Should reject with 400 Bad Request
	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 Bad Request for missing fields, got %v", rr.Code)
	}
}

func TestHandleSignIn_Success(t *testing.T) {
	hashBytes, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.DefaultCost)

	store := &mockAuthStore{
		user: &User{
			ID:           "usr_123",
			Email:        "binit@example.com",
			Name:         "Binit",
			PasswordHash: string(hashBytes),
		},
	}
	auth := New(Options{Store: store})

	payload := signInRequest{Email: "binit@example.com", Password: "correctpassword"}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/sign-in", bytes.NewReader(body))
	req.Header.Set("X-Authingo-Client", "true")
	rr := httptest.NewRecorder()

	auth.handleSignIn(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %v: %s", rr.Code, rr.Body.String())
	}

	cookies := rr.Result().Cookies()
	if len(cookies) == 0 || cookies[0].Name != "authingo_session" {
		t.Fatal("Expected authingo_session cookie to be set")
	}
}

func TestHandleSignIn_WrongPassword(t *testing.T) {
	hashBytes, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.DefaultCost)
	store := &mockAuthStore{
		user: &User{Email: "binit@example.com", PasswordHash: string(hashBytes)},
	}
	auth := New(Options{Store: store})

	payload := signInRequest{Email: "binit@example.com", Password: "WRONGpassword"}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/sign-in", bytes.NewReader(body))
	req.Header.Set("X-Authingo-Client", "true")
	rr := httptest.NewRecorder()

	auth.handleSignIn(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized for wrong password, got %v", rr.Code)
	}
}

func TestHandleSignIn_DatabaseError(t *testing.T) {
	store := &mockAuthStore{getUserErr: errors.New("database unavailable")}
	auth := New(Options{Store: store})

	payload := signInRequest{Email: "binit@example.com", Password: "correctpassword"}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/sign-in", bytes.NewReader(body))
	req.Header.Set("X-Authingo-Client", "true")
	rr := httptest.NewRecorder()

	auth.handleSignIn(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Errorf("Expected 500 Internal Server Error for database errors, got %v", rr.Code)
	}
}

func TestHandleGetSession_Valid(t *testing.T) {

	store := &mockAuthStore{
		user: &User{ID: "usr_123", Email: "binit@example.com"},
		session: &Session{
			Token:            "valid_token_abc",
			ExpiresAt:        time.Now().Add(1 * time.Hour), // Not expired
			RefreshExpiresAt: time.Now().Add(30 * 24 * time.Hour),
		},
	}
	auth := New(Options{Store: store})

	req := httptest.NewRequest(http.MethodGet, "/session", nil)

	req.AddCookie(&http.Cookie{Name: "authingo_session", Value: "valid_token_abc"})
	rr := httptest.NewRecorder()

	auth.handleGetSession(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK for valid session, got %v", rr.Code)
	}
}

func TestHandleGetSession_Expired(t *testing.T) {
	store := &mockAuthStore{
		user: &User{ID: "usr_123"},
		session: &Session{
			Token:            "expired_token",
			ExpiresAt:        time.Now().Add(-2 * time.Hour),  // Expired 2 hours ago
			RefreshExpiresAt: time.Now().Add(-24 * time.Hour), // Refresh also expired
		},
	}
	auth := New(Options{Store: store})

	req := httptest.NewRequest(http.MethodGet, "/session", nil)
	req.AddCookie(&http.Cookie{Name: "authingo_session", Value: "expired_token"})
	rr := httptest.NewRecorder()

	auth.handleGetSession(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized for expired session, got %v", rr.Code)
	}

	if !store.sessionDeleted {
		t.Error("Expected expired session to be automatically deleted from the database")
	}
}

func TestHandleSignOut(t *testing.T) {
	store := &mockAuthStore{}
	auth := New(Options{Store: store})

	req := httptest.NewRequest(http.MethodPost, "/sign-out", nil)
	req.Header.Set("X-Authingo-Client", "true")
	req.AddCookie(&http.Cookie{Name: "authingo_session", Value: "token_to_delete"})
	rr := httptest.NewRecorder()

	auth.handleSignOut(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK on sign out, got %v", rr.Code)
	}

	if !store.sessionDeleted {
		t.Error("Expected session to be deleted from the database")
	}

	// Verify the ghost cookie was sent to clear the browser
	cookie := rr.Result().Cookies()[0]
	if cookie.Value != "" {
		t.Errorf("Expected cookie to be cleared with empty value, got %s", cookie.Value)
	}
}

func TestHandleRefreshSession(t *testing.T) {
	store := &mockAuthStore{
		user: &User{ID: "usr_123", Email: "binit@example.com"},
		session: &Session{
			ID:               "ses_123",
			Token:            "old_access_token",
			RefreshToken:     "old_refresh_token",
			ExpiresAt:        time.Now().Add(-1 * time.Minute),
			RefreshExpiresAt: time.Now().Add(30 * 24 * time.Hour),
		},
	}
	auth := New(Options{Store: store})

	req := httptest.NewRequest(http.MethodPost, "/refresh", nil)
	req.Header.Set("X-Authingo-Client", "true")
	req.AddCookie(&http.Cookie{Name: "authingo_refresh", Value: "old_refresh_token"})
	rr := httptest.NewRecorder()

	auth.handleRefreshSession(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected 200 OK on refresh, got %v: %s", rr.Code, rr.Body.String())
	}
	if !store.refreshCalled {
		t.Error("Expected refresh token rotation to be called")
	}
}
