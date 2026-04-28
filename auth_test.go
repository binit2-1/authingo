package authingo

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

type mockStore struct{}

func (m *mockStore) CreateUser(ctx context.Context, user *User) error                { return nil }
func (m *mockStore) GetUserByEmail(ctx context.Context, email string) (*User, error) { return nil, nil }
func (m *mockStore) CreateSession(ctx context.Context, session *Session) error       { return nil }
func (m *mockStore) GetSession(ctx context.Context, token string) (*Session, *User, error) {
	return nil, nil, nil
}
func (m *mockStore) DeleteSession(ctx context.Context, token string) error { return nil }
func (m *mockStore) RefreshSession(ctx context.Context, oldToken string) (*Session, *User, error) {
	return nil, nil, nil
}
func (m *mockStore) CleanupExpiredSessions(ctx context.Context) error { 
    return nil 
}


// TestNew_RequiresStore ensures that our framework aggressively panics
// if a developer forgets to pass a database adapter.
func TestNew_RequireStore(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			t.Errorf("Expected authingo.New() to panic when Store is nil, but it did not")
		}
	}()

	// trigger panic by passing nil Store
	New(Options{
		Store: nil,
	})
}

// TestNew_RegistersRoutes verifies that the core routes are correctly mounted
// to the multiplexer upon initialization.
func TestNew_RegistersRoutes(t *testing.T) {
	auth := New(Options{
		Store: &mockStore{},
	})

	handler := auth.Handler()

	req := httptest.NewRequest(http.MethodPost, "/sign-up", nil)

	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status == http.StatusNotFound {
		t.Errorf("Handler returned 404 Not Found; expected the /sign-up route to be registered")
	}
}
