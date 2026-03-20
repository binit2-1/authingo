package authingo

import "net/http"

// Options holds the configuration for initializing AuthInGo.
type Options struct {
	// Store is the database adapter (Required).
	Store Store

	// Plugins is an optional list of extensions.
	Plugins []Plugin
}

// Auth is the core engine. It holds the database adapter and the HTTP router.
type Auth struct {
	store Store

	mux *http.ServeMux

	plugins []Plugin
}

// New initializes the AuthInGo framework.
//
// Example:
//
//	auth := authingo.New(authingo.Options{
//		Store: postgres.NewAdapter(dbConn),
//	})
func New(opts Options) *Auth {

	if opts.Store == nil {
		panic("authingo: Store (database adapter) is strictly required")

	}

	a := &Auth{
		store:   opts.Store,
		mux:     http.NewServeMux(),
		plugins: opts.Plugins,
	}

	a.registerCoreRoutes()

	// Initialize any provided plugins
	for _, p := range a.plugins {
		p.InjectRoutes(a.mux)
	}

	return a
}

func (a *Auth) Handler() http.Handler {
	return a.mux
}

func (a *Auth) registerCoreRoutes() {
	a.mux.HandleFunc("POST /sign-up", a.handleSignUp)
	a.mux.HandleFunc("POST /sign-in", a.handleSignIn)
	a.mux.HandleFunc("GET /session", a.handleGetSession)
	a.mux.HandleFunc("POST /sign-out", a.handleSignOut)
}

func (a *Auth) handleSignUp(w http.ResponseWriter, r *http.Request)     {}
func (a *Auth) handleSignIn(w http.ResponseWriter, r *http.Request)     {}
func (a *Auth) handleGetSession(w http.ResponseWriter, r *http.Request) {}
func (a *Auth) handleSignOut(w http.ResponseWriter, r *http.Request)    {}
