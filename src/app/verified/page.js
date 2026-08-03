import { redirect } from "next/navigation";

export default function LegacyVerifiedPage() {
  redirect("/auth/verified");
}
