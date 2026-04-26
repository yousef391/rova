"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // If login is successful, redirect to dashboard
      if (data.session) {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid items-center justify-center p-6 bg-[#0a0d14]">
      <div className="w-full max-w-md bg-[#141720] p-8 rounded-2xl border border-white/5">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/15 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="text-blue-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Admin Login
          </h1>
          <p className="text-sm tracking-wide text-gray-500 font-medium mt-1">
            Access the store dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 tracking-wide text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-4 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 pl-11 pr-4 py-4 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-[0_8px_20px_rgb(37,99,235,0.2)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight size={18} className="translate-y-[1px]" />
              </>
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
}
