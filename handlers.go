package authingo

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type signUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type signInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// handleSignUp processes new user registrations.
//
// It decodes the JSON request, hashes the password using bcrypt, creates the
// user and session in the database, and automatically sets a secure HttpOnly
// cookie containing the session token.
func (a *Auth) handleSignUp(w http.ResponseWriter, r *http.Request) {
	var req signUpRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON request body", http.StatusBadRequest)
		return
	}

	//basic validation, TODO: move to seperate validation layer or use external lib
	if req.Email == "" || req.Password == "" || req.Name == "" {
		http.Error(w, "Email, password, and name are required fields", http.StatusBadRequest)
		return
	}

	hashBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Internal server error during password hashing", http.StatusInternalServerError)
		return
	}

	now := time.Now().UTC()
	user := &User{
		ID:            generateID("usr_"),
		Email:         req.Email,
		Name:          req.Name,
		PasswordHash:  string(hashBytes),
		EmailVerified: false,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	err = a.store.CreateUser(r.Context(), user)
	if err != nil {
		log.Printf("DATABASE ERROR: %v\n", err)
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") || strings.Contains(err.Error(), "SQLSTATE 23505") {
			http.Error(w, "Email is already in use", http.StatusConflict)
			return
		}
		http.Error(w, "Internal server error connecting to database", http.StatusInternalServerError)
		return
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		http.Error(w, "Internal server error generating session", http.StatusInternalServerError)
		return
	}
	token := hex.EncodeToString(tokenBytes)

	refreshBytes := make([]byte, 64)
	if _, err := rand.Read(refreshBytes); err != nil {
		http.Error(w, "Internal server error generating session", http.StatusInternalServerError)
		return
	}
	refreshToken := hex.EncodeToString(refreshBytes)

	expiresAt := now.Add(15 * time.Minute)
	refreshExpiresAt := now.Add(30 * 24 * time.Hour)
	
	session := &Session{
		ID:               generateID("ses_"),
		UserID:           user.ID,
		Token:            token,
		RefreshToken:     refreshToken,
		ExpiresAt:        expiresAt,
		RefreshExpiresAt: refreshExpiresAt,
		CreatedAt:        now,
	}

	err = a.store.CreateSession(r.Context(), session)
	if err != nil {
		http.Error(w, "Failed to initialize user session", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "authingo_session",
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "authingo_refresh",
		Value:    refreshToken,
		Path:     "/api/auth/refresh",
		Expires:  refreshExpiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]any{"user": user})
}

// handleSignIn authenticates an existing user and establishes a new session.
//
// It expects a JSON payload containing an email and password. To defend against
// timing attacks (user enumeration), it performs a dummy bcrypt comparison if the
// user is not found. On success, it generates a 32-byte secure opaque token, saves
// the session to the database for 7 days, and sets an HttpOnly cookie.
func (a *Auth) handleSignIn(w http.ResponseWriter, r *http.Request) {
	var req signInRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON request body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required fields", http.StatusBadRequest)
		return
	}

	user, err := a.store.GetUserByEmail(r.Context(), req.Email)
	dummyHash := []byte("$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa")

	if err != nil || user == nil {
		bcrypt.CompareHashAndPassword(dummyHash, []byte(req.Password))
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		http.Error(w, "Internal server error generating session", http.StatusInternalServerError)
		return
	}
	token := hex.EncodeToString(tokenBytes)

	refreshBytes := make([]byte, 64)
	if _, err := rand.Read(refreshBytes); err != nil {
		http.Error(w, "Internal server error generating session", http.StatusInternalServerError)
		return
	}
	refreshToken := hex.EncodeToString(refreshBytes)

	now := time.Now().UTC()
	expiresAt := now.Add(15 * time.Minute)
	refreshExpiresAt := now.Add(30 * 24 * time.Hour)

	session := &Session{
		ID:               generateID("ses_"),
		UserID:           user.ID,
		Token:            token,
		RefreshToken:     refreshToken,
		ExpiresAt:        expiresAt,
		RefreshExpiresAt: refreshExpiresAt,
		CreatedAt:        now,
	}

	err = a.store.CreateSession(r.Context(), session)
	if err != nil {
		http.Error(w, "Failed to initialize user session", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "authingo_session",
		Value:    token,
		Path:     "/",
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "authingo_refresh",
		Value:    refreshToken,
		Path:     "/api/auth/refresh",
		Expires:  refreshExpiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]any{"user": user})

}

// handleGetSession validates the client's session cookie.
//
// It extracts the "authingo_session" cookie, looks up the corresponding session
// and user in the database, and verifies the session has not expired. If the
// session is expired, it automatically cleans it up from the database.
// Returns the sanitized User and Session objects as JSON.
func (a *Auth) handleGetSession(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("authingo_session")
	if err != nil || cookie.Value == "" {
		http.Error(w, "Unauthorized: No session cookie", http.StatusUnauthorized)
		return
	}

	session, user, err := a.store.GetSession(r.Context(), cookie.Value)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if session == nil || user == nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		return
	}

	if time.Now().After(session.RefreshExpiresAt){
		a.store.DeleteSession(r.Context(), cookie.Value)
		a.clearCookies(w)
		http.Error(w, "Unauthorized: Session permanently expired", http.StatusUnauthorized)
		return
	}

	if time.Now().After(session.ExpiresAt) {
		http.SetCookie(w, &http.Cookie{
			Name:     "authingo_session",
			Value:    "",
			Path:     "/",
			Expires:  time.Unix(0, 0),
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteLaxMode,
		})
		http.Error(w, "Unauthorized: Session expired", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"user":    user,
		"session": session,
	})

}

// handleSignOut terminates the current user's session.
//
// It reads the session cookie and deletes the corresponding session record from the
// database to ensure the token can never be used again. Finally, it forces the client
// browser to immediately expire and clear the cookie.
func (a *Auth) handleSignOut(w http.ResponseWriter, r *http.Request) {
	a.clearCookies(w)
	tokenToDelete := ""
	if cookie, err := r.Cookie("authingo_session"); err == nil && cookie.Value != "" {
		tokenToDelete = cookie.Value
	} else if refreshCookie, err := r.Cookie("authingo_refresh"); err == nil && refreshCookie.Value != "" {
		// Fallback: If access token is gone, try to use the refresh token to identify the session
		tokenToDelete = refreshCookie.Value
	}

	if tokenToDelete != "" {
		err := a.store.DeleteSession(r.Context(), tokenToDelete)
		if err != nil {
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (a *Auth) handleRefreshSession(w http.ResponseWriter, r *http.Request) {

	cookie, err := r.Cookie("authingo_refresh")
	if err != nil {
		http.Error(w, "Unauthorized: No refresh token", http.StatusUnauthorized)
		return
	}

	session, user, err := a.store.RefreshSession(r.Context(), cookie.Value)
	if err != nil {
		a.clearCookies(w)
		http.Error(w, "Unauthorized: Invalid or expired refresh token", http.StatusUnauthorized)
		return 
	}
	
	http.SetCookie(w, &http.Cookie{
		Name:     "authingo_session",
		Value:    session.Token,
		Path:     "/",
		Expires:  session.ExpiresAt,
		HttpOnly: true,
		Secure:   true, 
		SameSite: http.SameSiteLaxMode,
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "authingo_refresh",
		Value:    session.RefreshToken,
		Path:     "/api/auth/refresh", 
		Expires:  session.RefreshExpiresAt,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)

}

func generateID(prefix string) string {
	b := make([]byte, 16)
	rand.Read(b)
	return prefix + hex.EncodeToString(b)
}

func (a *Auth) clearCookies(w http.ResponseWriter) {
	past := time.Now().Add(-1 * time.Hour)
	http.SetCookie(w, &http.Cookie{Name: "authingo_session", Value: "", Path: "/", Expires: past, HttpOnly: true})
	http.SetCookie(w, &http.Cookie{Name: "authingo_refresh", Value: "", Path: "/api/auth/refresh", Expires: past, HttpOnly: true})
}