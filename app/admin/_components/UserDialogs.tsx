"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldBan, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ROLE_OPTIONS,
  UserRole,
  BAN_DURATIONS,
  BAN_REASONS,
} from "@/lib/admin-types";
import { User } from "@/lib/all-types";

interface ChangeRoleDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChanged: (userId: string, role: UserRole) => void;
}

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (userId: string) => void;
}

interface BanUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBanned: (userId: string) => void;
}

export function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onRoleChanged,
}: ChangeRoleDialogProps) {
  const [selected, setSelected] = useState<UserRole | null>(user?.role ?? null);
  const [isPending, startTransition] = useTransition();

  if (user && selected === null) setSelected(user.role);

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    onOpenChange(next);
    if (!next) setSelected(null);
  }

  function handleSubmit() {
    if (!user || !selected || selected === user.role) return;

    startTransition(async () => {
      console.log(selected);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/10">
              <ShieldCheck className="h-4.5 w-4.5 text-violet-500" />
            </div>
            <DialogTitle>Change role for {user?.name}</DialogTitle>
          </div>
          <DialogDescription>
            This changes what {user?.name} can access across the admin panel and
            provider tools.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label className="sr-only">Role</Label>
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelected(option.value)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-violet-500 bg-violet-500/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{option.label}</span>
                  {isSelected && (
                    <ShieldCheck className="h-4 w-4 text-violet-500" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selected || selected === user?.role || isPending}
          >
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Save role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onDeleted,
}: DeleteUserDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!user) return;

    startTransition(async () => {
      console.log(user);
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => !isPending && onOpenChange(next)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {user?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the account, its sessions, and linked data.
            This action can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
            className="bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600"
          >
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Delete user
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BanUserDialog({
  user,
  open,
  onOpenChange,
  onBanned,
}: BanUserDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [duration, setDuration] = useState<string>("7");
  const [isPending, startTransition] = useTransition();

  const needsDetail = reason === "Other";
  const canSubmit = reason !== "" && (!needsDetail || detail.trim().length > 0);

  function reset() {
    setReason("");
    setDetail("");
    setDuration("7");
  }

  function handleSubmit() {
    if (!user || !canSubmit) return;

    const finalReason = needsDetail
      ? detail.trim()
      : detail.trim()
        ? `${reason} — ${detail.trim()}`
        : reason;
    const durationDays = duration === "permanent" ? null : Number(duration);

    startTransition(async () => {
      console.log(finalReason, durationDays);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
          if (!next) reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center shrink-0 rounded-full bg-destructive/20">
              <ShieldBan className="size-4.5 text-destructive" />
            </div>
            <DialogTitle>Ban: {user?.name}</DialogTitle>
          </div>
          <DialogDescription>
            This revokes all active sessions and blocks sign-in until the ban is
            lifted or expires.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-start gap-2">
            <div className="space-y-2 w-full">
              <Label htmlFor="ban-reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="ban-reason" className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {BAN_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="ban-duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="ban-duration" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BAN_DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ban-detail">
              {needsDetail ? "Details" : "Additional details (optional)"}
            </Label>
            <Textarea
              id="ban-detail"
              placeholder={
                needsDetail
                  ? "Describe why this user is being banned…"
                  : "Add any extra context for the audit log…"
              }
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
          >
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Ban user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
