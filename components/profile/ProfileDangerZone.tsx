"use client";

import { useState } from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
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

  const handleDelete = async () => {
    if (confirmText !== "delete") return;
    if (error) return;

    setLoading(true);
    try {
      const { success } = await deleteAcount();
      if (!success) {
        throw new Error();
      }
      toast.success("Deleted successfully!");
      setConfirmText("");

      setTimeout(() => {
        setOpenDialog(false);
        router.replace("/");
      }, 1000);
    } catch {
      toast.error("Failed to delete.");
    } finally {
      setLoading(false);
    }
  };

  if (error) toast.error(error);

  return (
    <Card className="border-red-500/20 bg-red-500/2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <ShieldAlert className="h-4 w-4" />
          Danger Zone
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 rounded-xl border border-red-500/15 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Delete account permanently</p>
              <p className="text-sm text-muted-foreground">
                Removes your profile and all associated data. Cannot be undone.
              </p>
            </div>
          </div>

          <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="cursor-pointer"
              >
                Delete Account
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                <AlertDialogDescription>
                  Type <strong className="text-destructive">delete</strong> to
                  confirm this action.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Input
                className="mt-2"
                placeholder="delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />

              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel
                  variant="outline"
                  onClick={() => setConfirmText("")}
                >
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    disabled={confirmText !== "delete" || loading}
                    onClick={handleDelete}
                  >
                    {loading ? "Deleting..." : "Confirm"}
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
