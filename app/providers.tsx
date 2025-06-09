"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This will process the OAuth hash in the URL and set the session
    supabase.auth.getSession();
  }, []);

  return <>{children}</>;
}
