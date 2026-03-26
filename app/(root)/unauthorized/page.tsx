"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldX, Home, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 pb-10 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div className="relative overflow-hidden">
          <div className="relative p-8 md:p-10">
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ rotate: -6, scale: 0.95 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/15 bg-rose-500/10 shadow-sm"
              >
                <ShieldX className="h-10 w-10 text-rose-500" />
              </motion.div>
            </div>

            <div className="mb-5 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <LockKeyhole className="h-3.5 w-3.5" />
                Access Restricted
              </div>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                You’re not authorized
              </h1>
              <p className="mx-auto max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed">
                This area is protected and requires the appropriate permissions
                to continue. Please sign in with an authorized account or return
                to a safe page.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-background/70 p-4 md:p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl bg-primary/10 p-2">
                  <ShieldX className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Why am I seeing this?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You may be signed out, your session may have expired, or
                    your account does not have permission to access this page.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-2xl">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to home
                </Link>
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                If you believe this is a mistake, contact support or try
                refreshing your session.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
