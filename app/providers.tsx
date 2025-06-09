"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export const UserContext = createContext<{ user: any }>({ user: null });

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const handleOAuthRedirect = async () => {
      // Handle PKCE OAuth (code in query string)
      if (
        typeof window !== "undefined" &&
        window.location.search.includes("code=")
      ) {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          try {
            // Try to exchange code for session (Supabase PKCE flow)
            // @ts-ignore: exchangeCodeForSession may not be typed in all versions
            const { data, error } = await supabase.auth.exchangeCodeForSession({
              code,
            });
            if (error) {
              console.error("OAuth exchange error:", error.message);
            } else {
              setUser(data.session?.user ?? null);
              window.history.replaceState(null, "", window.location.pathname);
            }
          } catch (e) {
            console.error("exchangeCodeForSession error:", e);
          }
        }
      } else {
        // Fallback: check for access_token in hash (implicit flow)
        if (
          typeof window !== "undefined" &&
          window.location.hash.includes("access_token")
        ) {
          // Let Supabase process the hash (if needed)
          // Most modern setups use PKCE, so this is rare
          window.history.replaceState(null, "", window.location.pathname);
        }
        // Always try to get the session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error.message);
        }
        setUser(data.session?.user ?? null);
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

export function useUser() {
  return useContext(UserContext);
}
