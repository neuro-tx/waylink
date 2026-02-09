import { toast } from "sonner";
import { authClient } from "./auth-client";

export async function handleSocialAuth(provider: "github" | "google") {
  const res = await authClient.signIn.social({
    provider,
    callbackURL: "/",
  });

  if (res?.error) {
    toast.error(res.error.message || "Social login failed");
  } else {
    toast.success("Signed in successfully!");
  }
}
