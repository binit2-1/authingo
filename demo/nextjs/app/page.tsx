"use client";

import { useState } from "react";
import { signIn, signOut, signUp, useSession } from "@/lib/auth-client";

export default function Home() {
  const { data, isPending, error } = useSession();
  
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Binit Gupta");

  // --- LOADING STATE ---
  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">Loading session...</div>;
  }

  // --- AUTHENTICATED STATE (DASHBOARD) ---
  if (data?.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black">
        <div className="p-8 w-full max-w-md bg-white shadow-xl rounded-xl border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome, {data.user.name}!</h1>
          <div className="space-y-3 mb-8 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p><strong>ID:</strong> {data.user.id}</p>
            <p><strong>Email:</strong> {data.user.email}</p>
            <p><strong>Session Expires:</strong> {new Date(data.session?.expires_at || "").toLocaleString()}</p>
          </div>
          
          <button 
            onClick={async () => {
              await signOut();
              window.location.reload(); // Hard refresh to clear React state
            }}
            className="w-full bg-red-500 text-white font-medium p-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // --- UNAUTHENTICATED STATE (AUTH FORMS) ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black p-4">
      <div className="p-8 w-full max-w-md bg-white shadow-xl rounded-xl border border-gray-100">
        <h1 className="text-3xl font-bold mb-2 text-gray-800 text-center">AuthInGo</h1>
        <p className="text-center text-gray-500 mb-8">Test your Go backend.</p>
        
        {error && !error.includes("No session cookie") && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Name (for Sign Up)"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          
          <div className="flex gap-4 pt-4">
            <button 
              onClick={async () => {
                const res = await signIn.email({ email, password });
                if (!res.error) window.location.reload();
                else alert(res.error.message);
              }}
              className="flex-1 bg-gray-900 text-white font-medium p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
            
            <button 
              onClick={async () => {
                const res = await signUp.email({ email, password, name });
                if (!res.error) window.location.reload();
                else alert(res.error.message);
              }}
              className="flex-1 bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}