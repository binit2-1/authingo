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

const demoEndpoint =

  "https://authingo.onrender.com/api/auth";

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
    title: "Basic Authentication",
    description:
      "Implement a secure email/password login with the AuthInGo React SDK and server-owned cookie sessions.",
    icon: "password",
    seoMeta: {
      title: "Basic Authentication Playground",
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
    title: "Instant Revocation",
    description:
      "The opaque token advantage. Instantly kill database-backed sessions across devices.",
    icon: "shield",
    seoMeta: {
      title: "Instant Revocation Playground",
      description:
        "Explore how AuthInGo can revoke opaque, database-backed sessions instantly across devices and browser tabs.",
    },
    sandpackConfig: {
      template: "react-ts",
      files: placeholderFiles("Instant Revocation"),
    },
  },
  {
    id: "custom-ui",
    title: "Bring Your Own UI",
    description:
      "Total frontend freedom. Wire the headless AuthInGo SDK to any custom component.",
    icon: "palette",
    seoMeta: {
      title: "Custom UI Playground",
      description:
        "Build custom authentication interfaces with AuthInGo's headless React SDK and your own component system.",
    },
    sandpackConfig: {
      template: "react-ts",
      files: placeholderFiles("Bring Your Own UI"),
    },
  },
  {
    id: "protected-routes",
    title: "The Vault",
    description:
      "Secure specific routes and auto-redirect unauthenticated traffic.",
    icon: "vault",
    seoMeta: {
      title: "Protected Routes Playground",
      description:
        "Learn how to protect application routes and redirect unauthenticated users with AuthInGo session checks.",
    },
    sandpackConfig: {
      template: "react-ts",
      files: placeholderFiles("The Vault"),
    },
  },
];

export function getPlayground(id: string) {
  return playgrounds.find((playground) => playground.id === id);
}
