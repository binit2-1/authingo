import type {
  SandpackFiles,
  SandpackInternalOptions,
  SandpackPredefinedTemplate,
  SandpackSetup,
} from "@codesandbox/sandpack-react";

export type PlaygroundIcon = "password" | "shield" | "palette" | "vault";

export type PlaygroundSandpackConfig = {
  template?: SandpackPredefinedTemplate;
  files: SandpackFiles;
  customSetup?: SandpackSetup;
  options?: SandpackInternalOptions;
  visibleFiles?: string[];
  activeFile?: string;
};

export type PlaygroundConfig = {
  id: string;
  title: string;
  description: string;
  icon: PlaygroundIcon;
  seoMeta: {
    title: string;
    description: string;
  };
  sandpackConfig: PlaygroundSandpackConfig;
};

const demoEndpoint = "https://authingo.onrender.com/api/auth";

const basicAuthFiles: SandpackFiles = {
  "/App.tsx": {
    hidden: true,
    code: `import { useState } from "react";
import { Providers } from "./app/providers";
import { Login } from "./app/login";
import { SignUp } from "./app/sign-up";
import "./styles.css";

export default function App() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <Providers>
      <main className="page">
        <section className="panel">
          <div className="brand">
            <h1>AuthInGo</h1>
            <p>Test your Go backend.</p>
          </div>

          <div className="tabs">
            <button
              className={mode === "sign-in" ? "tab active" : "tab"}
              onClick={() => setMode("sign-in")}
              type="button"
            >
              Sign In
            </button>
            <button
              className={mode === "sign-up" ? "tab active" : "tab"}
              onClick={() => setMode("sign-up")}
              type="button"
            >
              Create Account
            </button>
          </div>

          {mode === "sign-in" ? <Login /> : <SignUp />}
        </section>
      </main>
    </Providers>
  );
}`,
  },
  "/lib/auth-client.ts": {
    code: `import { createAuthClient } from "@authingo/react";

export const authClient = createAuthClient({
  baseURL: "${demoEndpoint}",
});`,
  },
  "/app/providers.tsx": {
    code: `"use client";

import { AuthProvider } from "@authingo/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider baseURL="${demoEndpoint}">
      {children}
    </AuthProvider>
  );
}`,
  },
  "/app/login.tsx": {
    code: `"use client";

import { useState } from "react";
import { useAuth } from "@authingo/react";
import { authClient } from "../lib/auth-client";

export function Login() {
  const { user, isLoading, error, checkSession, logout } = useAuth();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password");

  if (isLoading) return <div className="card">Loading session...</div>;

  if (user) {
    return (
      <div className="dashboard">
        <h2>Welcome, {user.name || user.email}!</h2>
        <div className="session-details">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        <button className="button danger" onClick={() => logout()}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="form-stack">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? <p className="error">{error}</p> : null}

      <div className="actions">
        <button
          className="button"
          onClick={async () => {
            const result = await authClient.signIn.email({ email, password });
            if (!result.error) {
              await checkSession();
            }
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
}`,
  },
  "/app/sign-up.tsx": {
    code: `"use client";

import { useState } from "react";
import { useAuth } from "@authingo/react";
import { authClient } from "../lib/auth-client";

// Generate random email to prevent demo server collisions
const createDemoEmail = () =>
  \`demo-\${Math.random().toString(36).slice(2, 10)}@authingo.dev\`;

export function SignUp() {
  const { user, checkSession } = useAuth();
  const [email, setEmail] = useState(createDemoEmail);
  const [password, setPassword] = useState("correct-horse-battery-staple");
  const [name, setName] = useState("AuthInGo Demo");

  // Hide sign up form if already logged in
  if (user) return null;

  return (
    <div className="form-stack">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (for Sign Up)"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="button primary"
        onClick={async () => {
          const result = await authClient.signUp.email({
            email,
            password,
            name,
          });
          if (!result.error) {
            await checkSession();
          }
        }}
      >
        Create Account
      </button>
    </div>
  );
}`,
  },
  "/styles.css": {
    hidden: true,
    code: `* { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
body { margin: 0; min-height: 100vh; background: #f9fafb; color: #111827; }
.page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
.panel { width: 100%; max-width: 448px; background: #fff; border: 1px solid #f3f4f6; border-radius: 12px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }
.brand { text-align: center; margin-bottom: 32px; }
h1 { font-size: 30px; line-height: 36px; font-weight: 700; margin: 0 0 8px; color: #1f2937; }
h2 { font-size: 24px; line-height: 32px; font-weight: 700; margin: 0 0 24px; color: #1f2937; }
p { margin: 0; }
.brand p { color: #6b7280; }
.tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; margin-bottom: 24px; border-radius: 8px; background: #f3f4f6; padding: 4px; }
.tab { border: 0; border-radius: 6px; background: transparent; color: #6b7280; cursor: pointer; font-size: 14px; font-weight: 500; padding: 8px 12px; transition: background-color 0.2s, color 0.2s, box-shadow 0.2s; }
.tab:hover { color: #111827; }
.tab.active { background: #fff; color: #111827; box-shadow: 0 1px 2px rgba(0,0,0,0.08); }
.form-stack { display: flex; flex-direction: column; gap: 16px; }
input { width: 100%; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; color: #111827; font-size: 16px; outline: none; transition: box-shadow 0.2s, border-color 0.2s; }
input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.35); }
.actions { display: flex; gap: 16px; padding-top: 16px; }
.button { width: 100%; border: none; border-radius: 8px; padding: 12px; color: #fff; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
.button { background: #111827; }
.button:hover { background: #1f2937; }
.button.primary { background: #2563eb; }
.button.primary:hover { background: #1d4ed8; }
.button.danger { background: #ef4444; }
.button.danger:hover { background: #dc2626; }
.dashboard { display: flex; flex-direction: column; }
.session-details { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; border-radius: 8px; background: #f9fafb; padding: 16px; color: #4b5563; font-size: 14px; }
.error { border: 1px solid #fee2e2; border-radius: 8px; background: #fef2f2; color: #dc2626; padding: 12px; font-size: 14px; }`,
  },
};

const revocationFiles: SandpackFiles = {
  "/lib/auth-client.ts": {
    code: `import { createAuthClient } from "@authingo/react";

export const authClient = createAuthClient({
  baseURL: "${demoEndpoint}",
});`,
  },
  "/app/providers.tsx": {
    code: `"use client";

import { AuthProvider } from "@authingo/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider baseURL="${demoEndpoint}">
      {children}
    </AuthProvider>
  );
}`,
  },
  "/app/login.tsx": {
    code: `"use client";

import { useState } from "react";
import { useAuth } from "@authingo/react";
import { authClient } from "../lib/auth-client";

const createDemoEmail = () =>
  \`demo-\${Math.random().toString(36).slice(2, 8)}@authingo.dev\`;

export function Login() {
  const { checkSession, error: sessionError } = useAuth();
  const [email, setEmail] = useState(createDemoEmail);
  const [password, setPassword] = useState("password");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    // Auto-create account for demo purposes if it does not exist.
    const signUpResult = await authClient.signUp.email({
      email,
      password,
      name: "Demo User",
    });
    const result = await authClient.signIn.email({ email, password });

    if (!result.error) {
      await checkSession();
    } else {
      setAuthError(signUpResult.error?.message ?? result.error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="card">
      <p className="eyebrow">Authentication</p>
      <h2>Access Dashboard</h2>
      <p className="muted">Log in to view and manage your active sessions.</p>

      <form onSubmit={handleSignIn} className="form-stack">
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {authError || sessionError ? (
          <p className="error">{authError ?? sessionError}</p>
        ) : null}
        <button type="submit" className="button primary" disabled={isLoading}>
          {isLoading ? "Authenticating..." : "Secure Login"}
        </button>
      </form>
    </div>
  );
}`,
  },
  "/app/dashboard.tsx": {
    code: `"use client";

import { MonitorCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@authingo/react";

export function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="card">
      <div className="header-flex">
        <div>
          <p className="eyebrow">Security Center</p>
          <h2>Current Session</h2>
        </div>
        <ShieldAlert className="text-blue" size={28} />
      </div>

      <p className="muted mb-4">
        This is the real session returned by the AuthInGo backend. Revoking it
        calls logout(), deletes the database session, and returns you to login.
      </p>

      <div className="session-list">
        <div className="session-item current">
          <div className="device-info">
            <MonitorCheck size={20} className="text-blue" />
            <div>
              <strong>Current browser session</strong>
              <span className="badge">Live</span>
              <p className="meta">{user.email}</p>
              <p className="meta">User ID: {user.id}</p>
            </div>
          </div>
          <button onClick={() => logout()} className="button danger-outline">
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
}`,
  },
  "/App.tsx": {
    hidden: true,
    code: `import { useAuth } from "@authingo/react";
import { Dashboard } from "./app/dashboard";
import { Login } from "./app/login";
import { Providers } from "./app/providers";
import "./styles.css";

function AuthRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="card">
        <p className="muted">Loading secure session...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <Providers>
      <main className="shell">
        <AuthRouter />
      </main>
    </Providers>
  );
}`,
  },
  "/styles.css": {
    hidden: true,
    code: `* {
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
}

body {
  align-items: flex-start;
  background: #0a0a0a;
  color: #ededed;
  display: flex;
  justify-content: center;
  margin: 0;
  min-height: 100vh;
  padding-top: 40px;
}

.shell {
  max-width: 500px;
  padding: 20px;
  width: 100%;
}

.card {
  background: #171717;
  border: 1px solid #262626;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  padding: 32px;
}

.eyebrow {
  color: #00ADD8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
  text-transform: uppercase;
}

h2 {
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.muted {
  color: #a3a3a3;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
  color: #fca5a5;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  padding: 10px 12px;
}

.mb-4 {
  margin-bottom: 24px;
}

.text-blue {
  color: #00ADD8;
}

.text-muted {
  color: #737373;
}

.header-flex {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

label {
  color: #d4d4d4;
  display: flex;
  flex-direction: column;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
}

input {
  background: #0a0a0a;
  border: 1px solid #262626;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  outline: none;
  padding: 10px 12px;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #00ADD8;
}

.button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 16px;
  transition: all 0.2s;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.button.primary {
  background: #00ADD8;
  color: #000;
  margin-top: 8px;
  width: 100%;
}

.button.primary:hover:not(:disabled) {
  opacity: 0.9;
}

.button.danger-outline {
  background: transparent;
  border: 1px solid #450a0a;
  color: #ef4444;
  font-size: 12px;
  padding: 6px 12px;
}

.button.danger-outline:hover {
  background: #450a0a;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  align-items: center;
  background: #0a0a0a;
  border: 1px solid #262626;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  padding: 16px;
}

.session-item.current {
  border-color: rgba(0, 173, 216, 0.3);
}

.device-info {
  align-items: center;
  display: flex;
  gap: 16px;
}

.device-info strong {
  color: #e5e5e5;
  display: inline-block;
  font-size: 14px;
  margin-bottom: 2px;
}

.meta {
  color: #737373;
  font-size: 12px;
  margin: 0;
}

.badge {
  background: rgba(0, 173, 216, 0.1);
  border-radius: 4px;
  color: #00ADD8;
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  margin-left: 8px;
  padding: 2px 6px;
  text-transform: uppercase;
}`,
  },
};

const customUIFiles: SandpackFiles = {
  "/lib/auth-client.ts": {
    code: `import { createAuthClient } from "@authingo/react";

export const authClient = createAuthClient({
  baseURL: "${demoEndpoint}",
});`,
  },
  "/app/providers.tsx": {
    code: `"use client";

import { AuthProvider } from "@authingo/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider baseURL="${demoEndpoint}">
      {children}
    </AuthProvider>
  );
}`,
  },
  "/app/custom-login.tsx": {
    code: `"use client";

import { useState } from "react";
import { ArrowRight, AtSign, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@authingo/react";
import { authClient } from "../lib/auth-client";

const createDemoEmail = () =>
  \`demo-\${Math.random().toString(36).slice(2, 8)}@authingo.dev\`;

export function CustomLogin() {
  const { user, checkSession, logout, error: sessionError } = useAuth();
  const [email, setEmail] = useState(createDemoEmail);
  const [password, setPassword] = useState("password");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    // Demo helper: create the random account first, then use normal sign in.
    const signUpResult = await authClient.signUp.email({
      email,
      password,
      name: "AuthInGo Demo",
    });
    const result = await authClient.signIn.email({ email, password });

    if (!result.error) {
      await checkSession();
    } else {
      setAuthError(signUpResult.error?.message ?? result.error.message);
    }

    setIsLoading(false);
  };

  if (user) {
    return (
      <section className="auth-panel signed-in">
        <div className="panel-band">
          <span>session</span>
          <span>active</span>
        </div>

        <h1>Signed in</h1>
        <p className="muted">Current account</p>

        <div className="identity-strip">
          <span>{user.email}</span>
        </div>

        <button className="secondary-button" type="button" onClick={() => logout()}>
          <LogOut size={16} />
          Sign out
        </button>
      </section>
    );
  }

  return (
    <section className="auth-panel">
      <div className="panel-band">
        <span>AuthInGo</span>
        <span>headless</span>
      </div>

      <div className="panel-heading">
        <div>
          <p className="eyebrow">Custom Login UI</p>
          <h1>Build the form your product needs.</h1>
        </div>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <div className="field-control">
            <AtSign className="field-icon" size={18} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="demo@authingo.dev"
            />
          </div>
        </label>

        <label className="field">
          <span>Password</span>
          <div className="field-control">
            <KeyRound className="field-icon" size={18} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
            />
          </div>
        </label>

        {authError || sessionError ? (
          <p className="error">{authError ?? sessionError}</p>
        ) : null}

        <button className="primary-button" type="submit" disabled={isLoading}>
          <span>{isLoading ? "Creating session" : "Create demo session"}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </section>
  );
}`,
  },
  "/App.tsx": {
    hidden: true,
    code: `import { CustomLogin } from "./app/custom-login";
import { Providers } from "./app/providers";
import "./styles.css";

export default function App() {
  return (
    <Providers>
      <main className="page-shell">
        <CustomLogin />
      </main>
    </Providers>
  );
}`,
  },
  "/styles.css": {
    hidden: true,
    code: `@font-face {
  font-family: "Geist Sans";
  src: url("https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-sans/Geist-Variable.woff2") format("woff2");
  font-weight: 100 900;
}

@font-face {
  font-family: "Geist Pixel Square";
  src: url("https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-pixel/GeistPixel-Square.woff2") format("woff2");
  font-weight: 400;
}

:root {
  --brand: #0763EE;
  --brand-hover: #0752c6;
  --bg: #0a0a0a;
  --border: #262626;
  --muted: #a3a3a3;
}

* {
  box-sizing: border-box;
  font-family: "Geist Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0;
}

body {
  background: var(--bg);
  color: #ededed;
  margin: 0;
  min-height: 100vh;
}

.page-shell {
  align-items: center;
  background:
    linear-gradient(90deg, rgba(38, 38, 38, 0.45) 1px, transparent 1px),
    linear-gradient(180deg, rgba(38, 38, 38, 0.45) 1px, transparent 1px),
    var(--bg);
  background-size: 40px 40px;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 28px;
  position: relative;
}

.page-shell::before,
.page-shell::after {
  background-image: repeating-linear-gradient(
    315deg,
    rgba(115, 115, 115, 0.32) 0,
    rgba(115, 115, 115, 0.32) 1px,
    transparent 1px,
    transparent 50%
  );
  background-size: 10px 10px;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  content: "";
  height: 100%;
  position: fixed;
  top: 0;
  width: 38px;
}

.page-shell::before {
  left: max(16px, calc(50% - 500px));
}

.page-shell::after {
  right: max(16px, calc(50% - 500px));
}

.auth-panel {
  background: rgba(10, 10, 10, 0.94);
  border: 1px solid var(--border);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.44),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  max-width: 456px;
  min-height: 520px;
  overflow: hidden;
  position: relative;
  width: 100%;
  z-index: 1;
}

.auth-panel::before {
  background: linear-gradient(90deg, transparent, rgba(7, 99, 238, 0.48), transparent);
  content: "";
  height: 1px;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.panel-band {
  align-items: center;
  border-bottom: 1px solid var(--border);
  display: flex;
  height: 44px;
  justify-content: space-between;
}

.panel-band span {
  align-items: center;
  border-right: 1px solid var(--border);
  color: var(--muted);
  display: flex;
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 12px;
  height: 100%;
  padding: 0 18px;
}

.panel-band span:last-child {
  border-left: 1px solid var(--border);
  border-right: 0;
  color: var(--brand);
}

.panel-heading {
  padding: 34px 34px 24px;
}

.eyebrow {
  color: var(--brand);
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  margin: 0 0 10px;
}

h1 {
  color: #ffffff;
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.05;
  margin: 0;
}

.muted {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.login-form {
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 34px 34px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: #d4d4d4;
  font-size: 13px;
  font-weight: 560;
}

.field-control {
  align-items: center;
  background: #050505;
  border: 1px solid var(--border);
  display: flex;
  min-height: 48px;
  position: relative;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}

.field-control:focus-within {
  background: #080808;
  border-color: rgba(7, 99, 238, 0.76);
  box-shadow: 0 0 0 1px rgba(7, 99, 238, 0.28);
}

.field-icon {
  color: #737373;
  flex: 0 0 auto;
  margin-left: 15px;
  transition: color 0.18s;
}

.field-control:focus-within .field-icon {
  color: var(--brand);
}

input {
  background: transparent;
  border: 0;
  color: #ffffff;
  flex: 1;
  font-size: 14px;
  height: 48px;
  min-width: 0;
  outline: none;
  padding: 0 14px 0 12px;
}

input::placeholder {
  color: #525252;
}

.primary-button,
.secondary-button {
  align-items: center;
  border: 0;
  cursor: pointer;
  display: flex;
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 14px;
  font-weight: 400;
  gap: 10px;
  justify-content: center;
  min-height: 48px;
  transition: background 0.18s, box-shadow 0.18s, color 0.18s, transform 0.18s;
  width: 100%;
}

.primary-button {
  background: var(--brand);
  color: #ffffff;
  margin-top: 6px;
}

.primary-button:hover:not(:disabled) {
  background: var(--brand-hover);
  box-shadow: 0 0 28px rgba(7, 99, 238, 0.36);
  transform: translateY(-1px);
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.66;
}

.secondary-button {
  background: #ffffff;
  color: var(--bg);
  margin: 28px 34px 34px;
  width: calc(100% - 68px);
}

.secondary-button:hover {
  background: var(--brand);
  color: #ffffff;
  box-shadow: 0 0 28px rgba(7, 99, 238, 0.32);
}

.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.28);
  color: #fca5a5;
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  padding: 10px 12px;
}

.signed-in {
  min-height: auto;
  text-align: center;
}

.signed-in h1 {
  font-size: 32px;
  margin: 42px 34px 10px;
}

.identity-strip {
  background: #050505;
  border-bottom: 1px solid var(--border);
  border-top: 1px solid var(--border);
  color: #ededed;
  font-size: 13px;
  margin-top: 26px;
  overflow-wrap: anywhere;
  padding: 15px 18px;
}

@media (max-width: 520px) {
  .page-shell {
    padding: 20px;
  }

  .page-shell::before,
  .page-shell::after {
    display: none;
  }

  .panel-heading,
  .login-form {
    padding-left: 24px;
    padding-right: 24px;
  }

  h1 {
    font-size: 26px;
  }
}`,
  },
};

const protectedRoutesFiles: SandpackFiles = {
  "/lib/auth-client.ts": {
    code: `import { createAuthClient } from "@authingo/react";

export const authClient = createAuthClient({
  baseURL: "${demoEndpoint}",
});`,
  },
  "/app/providers.tsx": {
    code: `"use client";

import { AuthProvider } from "@authingo/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider baseURL="${demoEndpoint}">
      {children}
    </AuthProvider>
  );
}`,
  },
  "/app/protected-route.tsx": {
    code: `"use client";

import { LockKeyhole } from "lucide-react";
import { useAuth } from "@authingo/react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  fallback: React.ReactNode;
};

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <section className="route-card compact">
        <LockKeyhole size={22} />
        <div>
          <p className="eyebrow">Checking Session</p>
          <h1>Verifying access</h1>
        </div>
      </section>
    );
  }

  if (!user) {
    return fallback;
  }

  return <>{children}</>;
}`,
  },
  "/app/login.tsx": {
    code: `"use client";

import { useState } from "react";
import { ArrowRight, AtSign, KeyRound } from "lucide-react";
import { useAuth } from "@authingo/react";
import { authClient } from "../lib/auth-client";

const createDemoEmail = () =>
  \`demo-\${Math.random().toString(36).slice(2, 8)}@authingo.dev\`;

type LoginProps = {
  redirectFrom: string;
  onSuccess: () => void;
};

export function Login({ redirectFrom, onSuccess }: LoginProps) {
  const { checkSession, error: sessionError } = useAuth();
  const [email, setEmail] = useState(createDemoEmail);
  const [password, setPassword] = useState("password");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    // Demo helper: create the random account first, then use normal sign in.
    const signUpResult = await authClient.signUp.email({
      email,
      password,
      name: "Protected Route Demo",
    });
    const result = await authClient.signIn.email({ email, password });

    if (!result.error) {
      await checkSession();
      onSuccess();
    } else {
      setAuthError(signUpResult.error?.message ?? result.error.message);
    }

    setIsLoading(false);
  };

  return (
    <section className="route-card">
      <div className="panel-band">
        <span>redirect</span>
        <span>{redirectFrom}</span>
      </div>

      <div className="panel-body">
        <p className="eyebrow">Protected Route</p>
        <h1>Sign in before entering the private route.</h1>
        <p className="muted">
          The route guard checks AuthInGo session state. No session means this
          login screen is shown instead of private content.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <div className="field-control">
              <AtSign className="field-icon" size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="field-control">
              <KeyRound className="field-icon" size={18} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </label>

          {authError || sessionError ? (
            <p className="error">{authError ?? sessionError}</p>
          ) : null}

          <button className="primary-button" type="submit" disabled={isLoading}>
            <span>{isLoading ? "Creating session" : "Continue to private route"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}`,
  },
  "/app/private-dashboard.tsx": {
    code: `"use client";

import { Database, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@authingo/react";

export function PrivateDashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <section className="route-card">
      <div className="panel-band">
        <span>private</span>
        <span>/dashboard</span>
      </div>

      <div className="panel-body">
        <p className="eyebrow">Access Granted</p>
        <h1>Private dashboard</h1>
        <p className="muted">
          This screen only renders after AuthInGo confirms a valid
          database-backed session.
        </p>

        <div className="secure-list">
          <div className="secure-row">
            <ShieldCheck size={18} />
            <div>
              <strong>Authenticated user</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="secure-row">
            <Database size={18} />
            <div>
              <strong>Session source</strong>
              <span>Verified by the backend session endpoint</span>
            </div>
          </div>
        </div>

        <button className="secondary-button" type="button" onClick={() => logout()}>
          <LogOut size={16} />
          Sign out and lock route
        </button>
      </div>
    </section>
  );
}`,
  },
  "/App.tsx": {
    code: `import { useState } from "react";
import { Home, LockKeyhole } from "lucide-react";
import { Providers } from "./app/providers";
import { ProtectedRoute } from "./app/protected-route";
import { Login } from "./app/login";
import { PrivateDashboard } from "./app/private-dashboard";
import "./styles.css";

type RouteName = "public" | "dashboard";

function RouterDemo() {
  const [route, setRoute] = useState<RouteName>("public");

  return (
    <main className="page-shell">
      <section className="browser-shell">
        <nav className="route-tabs">
          <button
            type="button"
            className={route === "public" ? "active" : ""}
            onClick={() => setRoute("public")}
          >
            <Home size={16} />
            Public
          </button>
          <button
            type="button"
            className={route === "dashboard" ? "active" : ""}
            onClick={() => setRoute("dashboard")}
          >
            <LockKeyhole size={16} />
            Private
          </button>
        </nav>

        {route === "public" ? (
          <section className="route-card">
            <div className="panel-band">
              <span>public</span>
              <span>/</span>
            </div>
            <div className="panel-body">
              <p className="eyebrow">Public Route</p>
              <h1>Anyone can read this page.</h1>
              <p className="muted">
                Click the private tab to hit a protected route. Without a
                session, the guard shows the login screen instead.
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={() => setRoute("dashboard")}
              >
                <span>Open private route</span>
              </button>
            </div>
          </section>
        ) : (
          <ProtectedRoute
            fallback={
              <Login
                redirectFrom="/dashboard"
                onSuccess={() => setRoute("dashboard")}
              />
            }
          >
            <PrivateDashboard />
          </ProtectedRoute>
        )}
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Providers>
      <RouterDemo />
    </Providers>
  );
}`,
  },
  "/styles.css": {
    hidden: true,
    code: `@font-face {
  font-family: "Geist Sans";
  src: url("https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-sans/Geist-Variable.woff2") format("woff2");
  font-weight: 100 900;
}

@font-face {
  font-family: "Geist Pixel Square";
  src: url("https://cdn.jsdelivr.net/npm/geist@1.7.0/dist/fonts/geist-pixel/GeistPixel-Square.woff2") format("woff2");
  font-weight: 400;
}

:root {
  --brand: #0763EE;
  --brand-hover: #0752c6;
  --bg: #0a0a0a;
  --border: #262626;
  --muted: #a3a3a3;
}

* {
  box-sizing: border-box;
  font-family: "Geist Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: 0;
}

body {
  background: var(--bg);
  color: #ededed;
  margin: 0;
  min-height: 100vh;
}

.page-shell {
  align-items: center;
  background:
    linear-gradient(90deg, rgba(38, 38, 38, 0.48) 1px, transparent 1px),
    linear-gradient(180deg, rgba(38, 38, 38, 0.48) 1px, transparent 1px),
    var(--bg);
  background-size: 40px 40px;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  padding: 28px;
  position: relative;
}

.page-shell::before,
.page-shell::after {
  background-image: repeating-linear-gradient(
    315deg,
    rgba(115, 115, 115, 0.32) 0,
    rgba(115, 115, 115, 0.32) 1px,
    transparent 1px,
    transparent 50%
  );
  background-size: 10px 10px;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  content: "";
  height: 100%;
  position: fixed;
  top: 0;
  width: 38px;
}

.page-shell::before {
  left: max(14px, calc(50% - 500px));
}

.page-shell::after {
  right: max(14px, calc(50% - 500px));
}

.browser-shell {
  border: 1px solid var(--border);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.44);
  max-width: 620px;
  position: relative;
  width: min(100%, 620px);
  z-index: 1;
}

.route-tabs {
  background: #0a0a0a;
  border-bottom: 1px solid var(--border);
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 48px;
}

.route-tabs button {
  align-items: center;
  background: transparent;
  border: 0;
  border-right: 1px solid var(--border);
  color: #a3a3a3;
  cursor: pointer;
  display: flex;
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 13px;
  gap: 8px;
  justify-content: center;
  transition: background 0.18s, color 0.18s;
}

.route-tabs button:last-child {
  border-right: 0;
}

.route-tabs button:hover,
.route-tabs button.active {
  background: var(--brand);
  color: #ffffff;
}

.route-card {
  background: rgba(10, 10, 10, 0.96);
  min-height: 430px;
}

.route-card.compact {
  align-items: center;
  color: var(--brand);
  display: flex;
  gap: 16px;
  min-height: 240px;
  padding: 34px;
}

.panel-band {
  align-items: center;
  border-bottom: 1px solid var(--border);
  display: flex;
  height: 44px;
  justify-content: space-between;
}

.panel-band span {
  align-items: center;
  border-right: 1px solid var(--border);
  color: var(--muted);
  display: flex;
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 12px;
  height: 100%;
  padding: 0 18px;
}

.panel-band span:last-child {
  border-left: 1px solid var(--border);
  border-right: 0;
  color: var(--brand);
}

.panel-body {
  padding: 34px;
}

.eyebrow {
  color: var(--brand);
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 13px;
  margin: 0 0 10px;
}

h1 {
  color: #ffffff;
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.05;
  margin: 0 0 14px;
}

.muted {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
  margin: 0;
  max-width: 460px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 28px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  color: #d4d4d4;
  font-size: 13px;
  font-weight: 560;
}

.field-control {
  align-items: center;
  background: #050505;
  border: 1px solid var(--border);
  display: flex;
  min-height: 48px;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.field-control:focus-within {
  border-color: rgba(7, 99, 238, 0.76);
  box-shadow: 0 0 0 1px rgba(7, 99, 238, 0.28);
}

.field-icon {
  color: #737373;
  flex: 0 0 auto;
  margin-left: 15px;
}

.field-control:focus-within .field-icon {
  color: var(--brand);
}

input {
  background: transparent;
  border: 0;
  color: #ffffff;
  flex: 1;
  font-size: 14px;
  height: 48px;
  min-width: 0;
  outline: none;
  padding: 0 14px 0 12px;
}

.primary-button,
.secondary-button {
  align-items: center;
  border: 0;
  cursor: pointer;
  display: flex;
  font-family: "Geist Pixel Square", ui-monospace, monospace;
  font-size: 14px;
  gap: 10px;
  justify-content: center;
  min-height: 48px;
  transition: background 0.18s, box-shadow 0.18s, color 0.18s, transform 0.18s;
}

.primary-button {
  background: var(--brand);
  color: #ffffff;
  margin-top: 6px;
  width: 100%;
}

.primary-button:hover:not(:disabled) {
  background: var(--brand-hover);
  box-shadow: 0 0 28px rgba(7, 99, 238, 0.36);
  transform: translateY(-1px);
}

.primary-button:disabled {
  cursor: not-allowed;
  opacity: 0.66;
}

.secondary-button {
  background: #ffffff;
  color: var(--bg);
  margin-top: 24px;
  width: 100%;
}

.secondary-button:hover {
  background: var(--brand);
  color: #ffffff;
  box-shadow: 0 0 28px rgba(7, 99, 238, 0.32);
}

.secure-list {
  border: 1px solid var(--border);
  margin-top: 28px;
}

.secure-row {
  align-items: flex-start;
  border-bottom: 1px solid var(--border);
  display: grid;
  gap: 14px;
  grid-template-columns: auto 1fr;
  padding: 16px;
}

.secure-row:last-child {
  border-bottom: 0;
}

.secure-row svg {
  color: var(--brand);
  margin-top: 2px;
}

.secure-row strong {
  color: #ededed;
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

.secure-row span {
  color: #8b8b8b;
  display: block;
  font-size: 13px;
  overflow-wrap: anywhere;
}

.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.28);
  color: #fca5a5;
  font-size: 12px;
  line-height: 1.45;
  margin: 0;
  padding: 10px 12px;
}

@media (max-width: 560px) {
  .page-shell {
    padding: 18px;
  }

  .page-shell::before,
  .page-shell::after {
    display: none;
  }

  .panel-body {
    padding: 24px;
  }

  h1 {
    font-size: 26px;
  }
}`,
  },
};

export const playgrounds: PlaygroundConfig[] = [
  {
    id: "basic",
    title: "Email Login",
    description: "Create an account and sign in with the AuthInGo React SDK.",
    icon: "password",
    seoMeta: {
      title: "Email Login Playground",
      description:
        "Run a live AuthInGo email and password authentication flow with the React SDK, Go API routes, and server-owned cookie sessions.",
    },
    sandpackConfig: {
      template: "react-ts",
      files: basicAuthFiles,
      activeFile: "/app/login.tsx",
      visibleFiles: [
        "/lib/auth-client.ts",
        "/app/providers.tsx",
        "/app/login.tsx",
        "/app/sign-up.tsx",
      ],
      customSetup: {
        dependencies: {
          "@authingo/react": "latest",
        },
      },
    },
  },
  {
    id: "revocation",
    title: "Session Revocation",
    description:
      "Revoke the current database-backed session and return to login.",
    icon: "shield",
    seoMeta: {
      title: "Session Revocation Playground",
      description:
        "Explore how AuthInGo can revoke an opaque, database-backed session instantly from the React SDK.",
    },
    sandpackConfig: {
      template: "react-ts",
      files: revocationFiles,
      activeFile: "/app/dashboard.tsx",
      visibleFiles: [
        "/lib/auth-client.ts",
        "/app/providers.tsx",
        "/app/login.tsx",
        "/app/dashboard.tsx",
      ],
      customSetup: {
        dependencies: {
          "@authingo/react": "latest",
          "lucide-react": "latest",
        },
      },
    },
  },
  {
    id: "custom-ui",
    title: "Custom Login UI",
    description: "Wire AuthInGo actions to your own form components.",
    icon: "palette",
    seoMeta: {
      title: "Custom Login UI Playground",
      description:
        "Build custom authentication interfaces with AuthInGo's headless React SDK and your own component system.",
    },
    sandpackConfig: {
      template: "react-ts",
      files: customUIFiles,
      activeFile: "/app/custom-login.tsx",
      visibleFiles: [
        "/lib/auth-client.ts",
        "/app/providers.tsx",
        "/app/custom-login.tsx",
      ],
      customSetup: {
        dependencies: {
          "@authingo/react": "latest",
          "lucide-react": "latest",
        },
      },
    },
  },
  {
    id: "protected-routes",
    title: "Protected Routes",
    description: "Redirect signed-out users away from private pages.",
    icon: "vault",
    seoMeta: {
      title: "Protected Routes Playground",
      description:
        "Learn how to protect application routes and redirect unauthenticated users with AuthInGo session checks.",
    },
    sandpackConfig: {
      template: "react-ts",
      files: protectedRoutesFiles,
      activeFile: "/app/protected-route.tsx",
      visibleFiles: [
        "/lib/auth-client.ts",
        "/app/providers.tsx",
        "/app/protected-route.tsx",
        "/app/login.tsx",
        "/app/private-dashboard.tsx",
        "/App.tsx",
      ],
      customSetup: {
        dependencies: {
          "@authingo/react": "latest",
          "lucide-react": "latest",
        },
      },
    },
  },
];

export function getPlayground(id: string) {
  return playgrounds.find((playground) => playground.id === id);
}
