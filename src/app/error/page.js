import { redirect } from "next/navigation";

export default function LegacyErrorPage() {
  redirect("/auth/error");
}
