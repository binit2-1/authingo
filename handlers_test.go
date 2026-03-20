package authingo

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

type mockSignUpStore struct {
	savedUser *User
}

func (m *mockSignUpStore) CreateUser(ctx context.Context, user *User) error {
	m.savedUser = user
	return nil
}

func (m *mockSignUpStore) GetUserByEmail(ctx context.Context, email string) (*User, error) {
	return nil, nil
}
func (m *mockSignUpStore) CreateSession(ctx context.Context, session *Session) error { return nil }
func (m *mockSignUpStore) GetSession(ctx context.Context, token string) (*Session, *User, error) {
	return nil, nil, nil
}
func (m *mockSignUpStore) DeleteSession(ctx context.Context, token string) error { return nil }

func TestHandleSignUp_Success(t *testing.T) {
	store := &mockSignUpStore{}
	auth := New(Options{Store: store})

	payload := signUpRequest{
		Email:    "binit@example.com",
		Password: "supersecretpassword",
		Name:     "Binit Gupta",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/sign-up", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	rr := httptest.NewRecorder()

	auth.handleSignUp(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status 200 OK, got %v", status)
	}

	if store.savedUser == nil {
		t.Fatal("Expected user to be saved to the database, but it was not")
	}

	if store.savedUser.PasswordHash == "supersecretpassword" {
		t.Errorf("Password was stored in plain text!")
	}

	err := bcrypt.CompareHashAndPassword([]byte(store.savedUser.PasswordHash), []byte("supersecretpassword"))
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
	if strings.Contains(responseBody, "supersecretpassword") || strings.Contains(responseBody, store.savedUser.PasswordHash) {
		t.Errorf("SECURITY FLAW: Password or hash was leaked in the JSON response: %s", responseBody)
	}
}

func TestHandleSignUp_MissingFields(t *testing.T) {
	auth := New(Options{Store: &mockSignUpStore{}})

	// Payload missing the email and name
	payload := signUpRequest{Password: "password123"}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/sign-up", bytes.NewReader(body))
	rr := httptest.NewRecorder()

	auth.handleSignUp(rr, req)

	// Should reject with 400 Bad Request
	if rr.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 Bad Request for missing fields, got %v", rr.Code)
	}
}
