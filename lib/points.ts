import { supabase } from "./supabase";

// Get current user's ID
export async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

// Fetch user's points
export async function getUserPoints(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data?.points ?? 0;
}

// Increment user's points by 1
export async function incrementUserPoints(userId: string) {
  const { data, error } = await supabase.rpc("increment_points", {
    user_id: userId,
  });
  if (error) throw error;
  return data;
}

// Ensure the user has a profile row
export async function ensureUserProfile(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .upsert([{ id: userId }], { onConflict: "id" });
  if (error && error.message) {
    console.error("Error ensuring user profile:", error);
  }
}

// Helper: Log current user's ID to the console
export async function logCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (data?.user) {
    console.log("Your Supabase user id is:", data.user.id);
    return data.user.id;
  } else {
    console.log("Not signed in or error:", error);
    return null;
  }
}
