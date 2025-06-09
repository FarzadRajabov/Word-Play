"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Create a context to provide the user/session globally
export const UserContext = createContext<{ user: any }>({ user: null });

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (
        typeof window !== "undefined" &&
        window.location.hash.includes("access_token")
      ) {
        // Extract the access_token from the URL fragment
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        // Exchange the OAuth code in URL fragment for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          accessToken ?? ""
        );

        if (error) {
          console.error("OAuth exchange error:", error.message);
        } else {
          setUser(data.session?.user ?? null);
          // Clean up the URL
          window.history.replaceState(null, "", window.location.pathname);
        }
      } else {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      }

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => {
        listener?.subscription?.unsubscribe?.();
      };
    };

    handleOAuthRedirect();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

// Optional: export a hook for easy access
export function useUser() {
  return useContext(UserContext);
}
