import { createClient, supabase as defaultSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!token_hash || !type) {
    const errorMsg = encodeURIComponent("Verification parameters (token_hash or type) are missing from the link.");
    redirect(`/auth/error?message=${errorMsg}`);
  }

  const supabase = typeof createClient === "function" ? createClient() : defaultSupabase;

  if (!supabase) {
    const errorMsg = encodeURIComponent("Supabase server client is not configured.");
    redirect(`/auth/error?message=${errorMsg}`);
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  });

  if (error) {
    const errorMsg = encodeURIComponent(error.message || "Failed to verify email.");
    redirect(`/auth/error?message=${errorMsg}`);
  }

  redirect("/auth/verified");
}
