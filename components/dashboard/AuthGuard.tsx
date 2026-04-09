"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && mounted) {
          router.replace("/login");
        } else if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        if (mounted) router.replace("/login");
      }
    };

    checkSession();

    // Listen for auth state changes (like automatic logout or token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session && mounted) {
          router.replace("/login");
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center flex-col gap-4 text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-sm font-bold tracking-wide uppercase text-gray-500">Authenticating...</span>
      </div>
    );
  }

  return <>{children}</>;
}
