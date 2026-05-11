package main

import (
	"context"
	"database/sql"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/binit2-1/authingo"
	"github.com/binit2-1/authingo/adapters/postgres"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

type signupLimiter struct {
	mu      sync.Mutex
	clients map[string]*signupWindow
	limit   int
	window  time.Duration
}

type signupWindow struct {
	count     int
	resetTime time.Time
}

func newSignupLimiter(limit int, window time.Duration) *signupLimiter {
	return &signupLimiter{
		clients: make(map[string]*signupWindow),
		limit:   limit,
		window:  window,
	}
}

func (l *signupLimiter) allow(ip string) bool {
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()

	for key, client := range l.clients {
		if now.After(client.resetTime.Add(l.window)) {
			delete(l.clients, key)
		}
	}

	client := l.clients[ip]
	if client == nil || now.After(client.resetTime) {
		l.clients[ip] = &signupWindow{count: 1, resetTime: now.Add(l.window)}
		return true
	}

	if client.count >= l.limit {
		return false
	}

	client.count++
	return true
}

func clientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		return strings.TrimSpace(strings.Split(forwarded, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func rateLimitSignups(limiter *signupLimiter, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost && r.URL.Path == "/api/auth/sign-up" && !limiter.allow(clientIP(r)) {
			http.Error(w, "Too many demo sign-ups. Please wait before trying again.", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if isAllowedOrigin(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Authingo-Client")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func isAllowedOrigin(origin string) bool {
	if origin == "" {
		return false
	}

	origin = normalizeOrigin(origin)
	for _, configured := range strings.Split(os.Getenv("AUTHINGO_ALLOWED_ORIGINS"), ",") {
		if normalizeOrigin(configured) == origin {
			return true
		}
	}

	return origin == "http://localhost:3000" ||
		origin == "http://127.0.0.1:3000" ||
		origin == "https://authingo.binitt.dev" ||
		strings.HasSuffix(origin, ".csb.app") ||
		strings.HasSuffix(origin, ".codesandbox.io")
}

func normalizeOrigin(origin string) string {
	return strings.TrimRight(strings.TrimSpace(origin), "/")
}

func main() {
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Printf("Skipping .env load: %v", err)
	}

	db, err := sql.Open("pgx", demoDatabaseURL())
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	if err := prepareDemoDatabase(db); err != nil {
		log.Fatal("Failed to prepare database:", err)
	}
	startDemoUserCleanup(db)

	auth := authingo.New(authingo.Options{
		Store:   postgres.NewAdapter(db),
		Cookies: demoCookieOptions(),
	})

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()

		if err := db.PingContext(ctx); err != nil {
			http.Error(w, "database unavailable", http.StatusServiceUnavailable)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
	mux.Handle("/api/auth/", http.StripPrefix("/api/auth", auth.Handler()))

	handlerWithCORS := corsMiddleware(rateLimitSignups(newSignupLimiter(5, time.Minute), mux))

	port := demoServerPort()
	log.Printf("Go Backend running on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handlerWithCORS))
}

func prepareDemoDatabase(db *sql.DB) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return err
	}

	return postgres.ApplySchema(ctx, db)
}

func startDemoUserCleanup(db *sql.DB) {
	go func() {
		runDemoUserCleanup(db)

		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			runDemoUserCleanup(db)
		}
	}()
}

func runDemoUserCleanup(db *sql.DB) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	deleted, err := cleanupDemoUsers(ctx, db, time.Now().Add(-48*time.Hour))
	if err != nil {
		log.Printf("Demo cleanup error: failed to delete stale demo users: %v\n", err)
		return
	}
	if deleted > 0 {
		log.Printf("Demo cleanup deleted %d stale demo users\n", deleted)
	}
}

func cleanupDemoUsers(ctx context.Context, db *sql.DB, olderThan time.Time) (int64, error) {
	const batchSize int64 = 500
	const query = `
		WITH stale_demo_users AS (
			SELECT id
			FROM users
			WHERE email LIKE 'demo-%@authingo.dev'
			  AND created_at < $1
			ORDER BY created_at
			LIMIT $2
		)
		DELETE FROM users
		WHERE id IN (SELECT id FROM stale_demo_users)
	`

	var total int64
	for {
		result, err := db.ExecContext(ctx, query, olderThan, batchSize)
		if err != nil {
			return total, err
		}

		deleted, err := result.RowsAffected()
		if err != nil {
			return total, err
		}

		total += deleted
		if deleted < batchSize {
			return total, nil
		}
	}
}

func demoCookieOptions() authingo.CookieOptions {
	secure := false
	options := authingo.CookieOptions{
		Secure: &secure,
	}

	if os.Getenv("AUTHINGO_CROSS_SITE_COOKIES") == "true" {
		secure = true
		options.Secure = &secure
		options.SessionSameSite = http.SameSiteNoneMode
		options.RefreshSameSite = http.SameSiteNoneMode
	}

	return options
}

func demoDatabaseURL() string {
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		return databaseURL
	}

	return "postgres://authingo_demo:authingo_demo_password@localhost:5433/authingo_demo?sslmode=disable"
}

func demoServerPort() string {
	if port := os.Getenv("PORT"); port != "" {
		return port
	}

	return "8080"
}
