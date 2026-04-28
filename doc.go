// Package authingo provides a lightweight, secure, and developer-first
// authentication framework for Go applications.
//
// Unlike heavy identity providers, AuthInGo focuses on keeping authentication
// within your infrastructure using opaque tokens and database-backed sessions.
// It is designed to work seamlessly with modern frontend frameworks (like React/Next.js)
// via its companion npm package, @authingo/react.
//
// Key Features:
//
//   - Opaque Token Sessions: High security by keeping JWTs/session data out of the browser.
//   - Refresh Token Rotation: Built-in short-lived access tokens (15 minutes) and
//     long-lived refresh tokens (30 days) for silent, secure session renewals.
//   - Secure Defaults: Automatically handles HttpOnly, Secure, and SameSite cookie configurations.
//   - Pluggable Storage: Bring your own database via the Store interface (e.g., adapters/postgres).
//   - Middleware Protection: Built-in HTTP middleware to strictly secure your private routes.
//
// For complete guides and frontend integration instructions, visit the repository:
// https://github.com/binit2-1/authingo
package authingo