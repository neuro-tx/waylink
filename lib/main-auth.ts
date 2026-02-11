import { toast } from "sonner";
import { authClient } from "./auth-client";
import {
  SignInData,
  signInSchema,
  SignUpData,
  signUpSchema,
} from "@/validations";

export async function handleSocialAuth(provider: "github" | "google") {
  try {
    const res = await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });

    if (res?.error) {
      toast.error(res.error.message || `Failed to sign in with ${provider}`);
      return;
    }

    toast.success("Welcome back buddy!");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    toast.error(errorMessage);
  }
}

export async function signIn(signData: SignInData) {
  const validation = signInSchema.safeParse(signData);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    toast.error(firstError.message);
    return;
  }
  const { email, password } = validation.data;

  try {
    const res = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
      rememberMe: true,
    });
    if (res?.error) {
      toast.error(res.error.message || "Failed to sign in. Please try again.");
      return;
    }
    toast.success("Signed in successfully!");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function signUp(signUp: SignUpData) {
  const validation = signUpSchema.safeParse(signUp);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    toast.error(firstError.message);
    return { success: false, error: firstError.message };
  }

  const { email, password, name } = validation.data;

  try {
    const res = await authClient.signUp.email({
      email,
      name,
      password,
      callbackURL: "/",
    });
    if (res?.error) {
      toast.error(
        res.error.message || "Failed to create account. Please try again.",
      );
      return;
    }
    toast.success("Account created successfully! Welcome aboard!");
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    toast.error(errorMessage);
  }
}
