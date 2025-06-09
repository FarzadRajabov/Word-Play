"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// Create a context to provide the user/session globally
export const UserContext = createContext<{ user: any }>({ user: null });

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This will process the OAuth hash in the URL and set the session
    supabase.auth.getSession();
  }, []);

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

// Optional: export a hook for easy access
export function useUser() {
  return useContext(UserContext);
}
