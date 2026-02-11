"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, Loader2, Github, Plus, Send } from "lucide-react";
import Image from "next/image";
import { handleSocialAuth, signIn, signUp } from "@/lib/main-auth";
import {
  signInSchema,
  signUpSchema,
  SignInData,
  SignUpData,
} from "@/validations";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [githubPending, startGithubTrans] = useTransition();
  const [GooglePending, startGoogleTrans] = useTransition();
  const [isPending, startTransition] = useTransition();

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSignIn = (data: SignInData) => {
    startTransition(async () => {
      await signIn(data);
    });
  };

  const onSignUp = (data: SignUpData) => {
    startTransition(async () => {
      await signUp(data);
    });
  };

  function providerAuth(prov: "google" | "github") {
    if (prov === "google") {
      startGoogleTrans(async () => {
        await handleSocialAuth("google");
      });
    } else {
      startGithubTrans(async () => {
        await handleSocialAuth("github");
      });
    }
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    signInForm.reset();
    signUpForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120 p-0 gap-0 bg-transparent border-none shadow-none overflow-hidden">
        <div className="relative">
          {/* Geometric background elements */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl" />

          {/* Main container */}
          <div className="relative bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            {/* Header */}
            <DialogHeader className="px-8 pt-8 pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold font-mono tracking-tight bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {isSignUp ? "CREATE_ACCOUNT" : "AUTHENTICATE"}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-mono text-purple-500 mt-1">
                      {"// "}
                      {isSignUp ? (
                        <>
                          <span className="text-green-500">Register</span> new{" "}
                          <span className="text-orange-2">user</span>
                        </>
                      ) : (
                        <>
                          <span className="text-orange-1">Access</span> your{" "}
                          <span className="text-cyan-500">account</span>
                        </>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="px-8 pb-8">
              {/* Social Auth Buttons */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-purple-500 to-transparent" />
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400 tracking-wider">
                    OAUTH_PROVIDERS
                  </span>
                  <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-purple-500 to-transparent" />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all group cursor-pointer"
                    onClick={() => providerAuth("google")}
                    disabled={GooglePending || githubPending || isPending}
                  >
                    {GooglePending ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Image
                          src="/icons/google.svg"
                          alt="google-logo"
                          width={18}
                          height={18}
                        />
                      </>
                    )}
                    Continue with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 hover:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group cursor-pointer"
                    onClick={() => providerAuth("github")}
                    disabled={githubPending || GooglePending || isPending}
                  >
                    {githubPending ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Github className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                      </>
                    )}
                    Continue with Github
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 my-6">
                <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-green-500 to-transparent" />
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400 tracking-wider">
                  OR_CREDENTIALS
                </span>
                <div className="h-0.5 flex-1 bg-linear-to-r from-transparent via-green-500 to-transparent" />
              </div>

              {/* Sign In Form */}
              {!isSignUp && (
                <Form {...signInForm}>
                  <form
                    onSubmit={signInForm.handleSubmit(onSignIn)}
                    className="space-y-5"
                  >
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            email<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="user@example.com"
                              className="font-mono border-2 focus:border-lime-500 dark:focus:border-lime-400 transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            </div>
                            password<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="font-mono border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-all pr-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      variant="outline"
                      disabled={isPending || GooglePending || githubPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          sign in
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {/* Sign Up Form */}
              {isSignUp && (
                <Form {...signUpForm}>
                  <form
                    onSubmit={signUpForm.handleSubmit(onSignUp)}
                    className="space-y-3"
                  >
                    <FormField
                      control={signUpForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <User className="w-3 h-3 text-green-600 dark:text-green-400" />
                            </div>
                            user_name<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John Doe"
                              className="font-mono border-2 focus:border-lime-500 dark:focus:border-lime-400 transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                            email<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="user@example.com"
                              className="font-mono border-2 focus:border-sky-500 dark:focus:border-sky-400 transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-mono text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            </div>
                            password<span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="font-mono border-2 focus:border-purple-500 dark:focus:border-purple-400 transition-all pr-10"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="font-mono text-xs" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isPending || GooglePending || githubPending}
                      variant="outline"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          creating account...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          sign up
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {/* Toggle Sign In/Up */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
                <p className="text-center text-sm font-mono text-gray-600 dark:text-gray-400">
                  {isSignUp ? (
                    <>
                      <span className="text-gray-500">
                        // Already registered?
                      </span>{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        disabled={isPending}
                      >
                        SIGN_IN
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-500">// New user?</span>{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                        disabled={isPending}
                      >
                        CREATE_ACCOUNT
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* Status indicator */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${isPending ? "bg-red-500" : "bg-green-500"}`}
                />
                <span>STATUS: {isPending ? "PROCESSING..." : "READY"}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
