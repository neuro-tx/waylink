"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Trash2, AlertTriangle, Loader } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useUserSessions } from "@/hooks/useSession";
import { useRouter } from "next/navigation";

export function ProfileDangerZone() {
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const { error, deleteAcount } = useUserSessions();
  const router = useRouter();

  const isConfirmed = confirmText === "delete";

  const handleDelete = async () => {
    if (!isConfirmed || error) return;

    setLoading(true);
    try {
      const { success } = await deleteAcount();
      if (!success) throw new Error();
      toast.success("Account deleted successfully.");
      setConfirmText("");

      setTimeout(() => {
        setOpenDialog(false);
        router.replace("/");
      }, 1000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) toast.error(error);

  return (
    <div>
      <Card className="border border-red-500/15 bg-red-500/2 transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide text-red-500/90 uppercase">
            <ShieldAlert className="h-4.5 w-4.5" />
            Danger Zone
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 rounded-xl border border-red-500/20 bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                <Trash2 className="h-4 w-4" />
              </div>

              <div className="space-y-0.5">
                <p className="text-sm font-medium">
                  Delete account permanently
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Removes your profile and all associated data.{" "}
                  <span className="font-medium text-red-500">
                    This cannot be undone.
                  </span>
                </p>
              </div>
            </div>

            <AlertDialog
              open={openDialog}
              onOpenChange={setOpenDialog}
            >
              <AlertDialogTrigger asChild>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="shrink-0"
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                  </Button>
                </motion.div>
              </AlertDialogTrigger>

              <AlertDialogContent className="gap-0 overflow-hidden p-0">
                <div className="border-b border-red-500/12 bg-red-500/5 px-6 pt-6 pb-5">
                  <div className="mb-3 flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15 text-red-500"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </motion.div>

                    <AlertDialogTitle className="text-base font-semibold">
                      Delete Account?
                    </AlertDialogTitle>
                  </div>

                  <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                    This will permanently remove your account, all your data,
                    preferences, and history. There is no way to recover it.
                  </AlertDialogDescription>
                </div>

                <div className="space-y-4 px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {["Profile deleted", "Data erased", "Cannot recover"].map(
                      (label, index) => (
                        <motion.span
                          key={label}
                          initial={{ x: 50 }}
                          animate={{ x: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: index * 0.05,
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-500/15 bg-red-500/5 px-2.5 py-1 text-xs font-medium text-red-500/80 hover:border-red-500/35"
                        >
                          <span className="inline-block h-1 w-1 rounded-full bg-red-500/60" />
                          {label}
                        </motion.span>
                      ),
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Type{" "}
                      <span className="font-mono font-semibold text-destructive">
                        "delete"
                      </span>{" "}
                      to confirm
                    </label>

                    <motion.div
                      animate={
                        confirmText.length > 0 && !isConfirmed
                          ? { x: [0, -4, 4, -3, 3, 0] }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.35 }}
                    >
                      <Input
                        className={`font-mono text-sm transition-all duration-200 focus-visible:ring-red-500/20 ${
                          isConfirmed
                            ? "border-red-500/60 focus-visible:ring-red-500/20"
                            : ""
                        }`}
                        placeholder="delete"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </motion.div>
                  </div>
                </div>

                <AlertDialogFooter className="gap-2 border-t border-border/60 px-6 py-4">
                  <AlertDialogCancel
                    onClick={() => setConfirmText("")}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </AlertDialogCancel>

                  <div className="flex-1 rounded-md sm:flex-none">
                    <Button
                      variant="destructive"
                      disabled={!isConfirmed || loading}
                      onClick={handleDelete}
                      className={`w-full transition-all duration-200 cursor-pointer ${
                        isConfirmed && !loading
                          ? "bg-red-500 hover:bg-red-600 opacity-100"
                          : "opacity-50"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader className="h-3.5 w-3.5 animate-spin" />
                          Deleting…
                        </span>
                      ) : (
                        "Yes, delete my account"
                      )}
                    </Button>
                  </div>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
