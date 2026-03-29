"use client";

import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";

const LoadingAuth = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden bg-transparent">
          <div className="relative p-8">
            <div className="flex items-center justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15"
              >
                <ShieldCheck className="h-8 w-8 text-primary" />
              </motion.div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Verifying your session
              </h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we securely load your account.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={{ x: "-100%" }}
                  animate={{ x: "220%" }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ width: "40%" }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Authenticating...</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingAuth;
