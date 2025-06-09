"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Create a context to provide the user/session globally
export const UserContext = createContext<{ user: any }>({ user: null });

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // If redirected from OAuth, force reload to let Supabase process the hash
    if (
      typeof window !== "undefined" &&
      window.location.hash.includes("access_token")
    ) {
      window.location.reload();
      return;
    }
    // Get the current session (handles OAuth hash on load)
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth state changes (login, logout, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

// Optional: export a hook for easy access
export function useUser() {
  return useContext(UserContext);
}
