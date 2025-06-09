"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export const UserContext = createContext<{ user: any }>({ user: null });

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // If redirected from OAuth, Supabase will already have the session
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error.message);
      }
      setUser(data.session?.user ?? null);

      // Remove the URL fragment (optional clean-up)
      if (window?.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      // Subscribe to auth state changes
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

export function useUser() {
  return useContext(UserContext);
}
