package authingo

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type signUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}


// handleSignUp processes new user registrations.
//
// It decodes the JSON request, hashes the password using bcrypt, creates the
// user and session in the database, and automatically sets a secure HttpOnly
// cookie containing the session token.
func (a *Auth) handleSignUp(w http.ResponseWriter, r *http.Request) {
	var req signUpRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
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
		http.Error(w, "Email is already in use", http.StatusConflict)
		return
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		http.Error(w, "Internal server error generating session", http.StatusInternalServerError)
		return
	}
	token := hex.EncodeToString(tokenBytes)

	expiresAt := now.Add(7 * 24 * time.Hour)
	session := &Session{
		ID:        generateID("ses_"),
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}

	err = a.store.CreateSession(r.Context(), session)
	if err != nil {
		http.Error(w, "Failed to initialize user session", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name: "authingo_session",
		Value: token,
		Path: "/",
		Expires: expiresAt,
		HttpOnly: true,
		Secure: true,
		SameSite: http.SameSiteLaxMode,
	})


	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)


	json.NewEncoder(w).Encode(map[string]any{"user": user})
}

func generateID(prefix string) string {
	b := make([]byte, 16)
	rand.Read(b)
	return prefix + hex.EncodeToString(b)
}
