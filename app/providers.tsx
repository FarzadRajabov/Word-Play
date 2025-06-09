"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Global user context
export const UserContext = createContext<{ user: User | null }>({ user: null });

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const handleOAuthRedirect = async () => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);

      // Handle PKCE OAuth (code in query string)
      if (url.searchParams.has("code")) {
        const code = url.searchParams.get("code");
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code!
          );
          if (error) {
            console.error("OAuth exchange error:", error.message);
          } else {
            setUser(data.session?.user ?? null);
            // Clean URL
            window.history.replaceState(null, "", window.location.pathname);
          }
        } catch (err) {
          console.error("exchangeCodeForSession failed:", err);
        }
      }

      // Retry session fetch (in case it's not ready instantly)
      let tries = 0;
      while (tries < 10) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("getSession error:", error.message);
          break;
        }

        if (data.session?.user) {
          setUser(data.session.user);
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
        tries++;
      }

      // Subscribe to auth state changes
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );

      unsubscribe = () => listener?.subscription?.unsubscribe?.();
    };

    handleOAuthRedirect();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

// Optional user hook
export function useUser() {
  return useContext(UserContext);
}
