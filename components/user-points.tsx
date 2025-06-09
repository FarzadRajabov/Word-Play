"use client";
import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/lib/points";

export function UserPoints() {
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPoints() {
      setLoading(true);
      setError(null);
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          setPoints(null);
          setError("Not signed in");
        } else {
          const pts = await import("@/lib/points").then((m) =>
            m.getUserPoints(userId)
          );
          setPoints(pts);
        }
      } catch (e: any) {
        setError(e.message || "Error fetching points");
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, []);

  let content;
  if (loading) content = "Loading...";
  else if (error) content = error;
  else if (points !== null) content = `🏆 Points: ${points}`;
  else content = "No points found";

  return (
    <div className="fixed top-6 left-6 z-50 bg-primary-100/90 border border-primary-300 rounded-xl px-6 py-3 shadow-lg font-semibold text-primary-900 text-lg flex items-center gap-2">
      <span role="img" aria-label="Points">
        🏆
      </span>
      <span>{content.replace(/^🏆 /, "")}</span>
    </div>
  );
}
