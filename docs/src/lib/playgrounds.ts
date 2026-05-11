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

const placeholderFiles = (title: string): SandpackFiles => ({
  "/App.tsx": `import "./styles.css";

export default function App() {
  return (
    <main className="shell">
      <section className="card">
        <p>Coming soon</p>
        <h1>${title}</h1>
        <span>This playground is registered and ready for implementation.</span>
      </section>
    </main>
  );
}`,
  "/styles.css": {
    hidden: true,
    code: `body {
  margin: 0;
  background: #050505;
  color: white;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.card {
  max-width: 420px;
  border: 1px solid #262626;
  border-radius: 16px;
  padding: 28px;
}

p {
  color: #0763ee;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0 0 12px;
}`,
  },
});

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
      files: placeholderFiles("Custom Login UI"),
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
      files: placeholderFiles("Protected Routes"),
    },
  },
];

export function getPlayground(id: string) {
  return playgrounds.find((playground) => playground.id === id);
}
