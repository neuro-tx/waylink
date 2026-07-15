"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Clock3,
  InfinityIcon,
  Loader2,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";
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
import { ROLE_OPTIONS, UserRole } from "@/lib/admin-types";
import { User } from "@/lib/all-types";
import { banUser } from "@/actions/user.actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { banSchema, BanSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { formatBanExpiry } from "@/lib/helpers";

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

const BAN_REASONS = [
  "Spam",
  "Abusive behavior",
  "Fraudulent activity",
  "Policy violation",
  "Other",
] as const;

const UNIT_LABEL: Record<NonNullable<BanSchema["unit"]>, [string, string]> = {
  m: ["Minute", "Minutes"],
  h: ["Hour", "Hours"],
  d: ["Day", "Days"],
  w: ["Week", "Weeks"],
  mo: ["Month", "Months"],
};

const UNIT_SECONDS: Record<NonNullable<BanSchema["unit"]>, number> = {
  m: 60,
  h: 3600,
  d: 86400,
  w: 604800,
  mo: 2592000,
};

function pluralize(n: number, [singular, plural]: [string, string]) {
  return n === 1 ? singular : plural;
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
  const [isPending, startTransition] = useTransition();
  const [permanent, setPermanent] = useState(false);

  const form = useForm({
    resolver: zodResolver(banSchema),
    defaultValues: {
      reason: "",
      duration: "7",
      unit: "d",
      detail: "",
    },
  });

  const { control, watch, setValue, setError, handleSubmit, reset, formState } =
    form;

  const reason = watch("reason");
  const duration = watch("duration");
  const unit = watch("unit");
  const needsDetail = reason === "Other";

  function togglePermanent(checked: boolean) {
    setPermanent(checked);
    if (checked) {
      setValue("duration", undefined, { shouldValidate: true });
      setValue("unit", undefined, { shouldValidate: true });
    } else {
      setValue("unit", "d", { shouldValidate: true });
      setValue("duration", "7", { shouldValidate: true });
    }
  }

  const summary = useMemo(() => {
    if (permanent) {
      return {
        tone: "severe" as const,
        title: `${user?.name ?? "This user"} will be banned permanently`,
        detail:
          "No automatic expiry — an admin has to manually unban this account.",
      };
    }

    if (
      !duration ||
      !unit ||
      !/^\d+$/.test(duration) ||
      Number(duration) <= 0
    ) {
      return null;
    }

    const n = Number(duration);
    const label = pluralize(n, UNIT_LABEL[unit]).toLowerCase();
    const expiry = formatBanExpiry(duration, UNIT_SECONDS[unit]);

    return {
      tone: "temporary" as const,
      title: `${user?.name ?? "This user"} will be banned for ${n} ${label}`,
      detail: expiry
        ? `Access is automatically restored around ${expiry}.`
        : undefined,
    };
  }, [permanent, duration, unit, user?.name]);

  function onSubmit(values: BanSchema) {
    if (!user) return;

    if (needsDetail && !values.detail?.trim()) {
      setError("detail", {
        type: "manual",
        message: "Please describe why this user is being banned.",
      });
      return;
    }

    const trimmedDetail = values.detail?.trim();
    const finalReason = needsDetail
      ? (trimmedDetail as string)
      : trimmedDetail
        ? `${values.reason} — ${trimmedDetail}`
        : values.reason;

    const ban =
      !permanent && values.duration && values.unit
        ? { duration: values.duration, unit: values.unit }
        : undefined;

    startTransition(async () => {
      const result = await banUser(user.id, finalReason, ban);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onBanned(user.id);
      toast.success(
        permanent
          ? "The user has been permanently banned."
          : "The user has been banned successfully.",
      );
      onOpenChange(false);
      form.reset();
      setPermanent(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) {
          onOpenChange(next);
          if (!next) {
            reset();
            setPermanent(false);
          }
        }
      }}
    >
      <DialogContent>
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

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
            <FormField
              control={control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BAN_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-md border p-3 border-dashed">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Duration</Label>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="permanent-ban"
                    checked={permanent}
                    onCheckedChange={(checked) =>
                      togglePermanent(checked === true)
                    }
                  />
                  <Label
                    htmlFor="permanent-ban"
                    className="text-xs font-normal text-muted-foreground cursor-pointer"
                  >
                    Permanent ban
                  </Label>
                </div>
              </div>

              <div className="flex gap-2">
                <FormField
                  control={control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={
                            permanent
                              ? "Permanent ban"
                              : "Enter a positive number (e.g. 7)"
                          }
                          disabled={permanent}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value}
                        onValueChange={(value) =>
                          field.onChange(value as BanSchema["unit"])
                        }
                        disabled={permanent}
                      >
                        <FormControl>
                          <SelectTrigger className="w-30">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="m">Minutes</SelectItem>
                          <SelectItem value="h">Hours</SelectItem>
                          <SelectItem value="d">Days</SelectItem>
                          <SelectItem value="w">Weeks</SelectItem>
                          <SelectItem value="mo">Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={control}
              name="detail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {needsDetail ? "Details" : "Additional details (optional)"}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        needsDetail
                          ? "Describe why this user is being banned…"
                          : "Add any extra context for the audit log…"
                      }
                      rows={3}
                      {...field}
                      className="text-muted-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {summary && (
              <div className="overflow-hidden">
                <div
                  className={
                    "flex items-start gap-2.5 rounded-md border px-3.5 py-3 " +
                    (summary.tone === "severe"
                      ? "border-rose-500/25 bg-rose-500/10"
                      : "border-amber-500/25 bg-amber-500/10")
                  }
                >
                  {summary.tone === "severe" ? (
                    <InfinityIcon className="mt-0.75 size-4 shrink-0 text-rose-500" />
                  ) : (
                    <Clock3 className="mt-0.75 size-4 shrink-0 text-amber-500" />
                  )}
                  <div className="space-y-0.5">
                    <p
                      className={
                        "text-sm font-medium " +
                        (summary.tone === "severe"
                          ? "text-rose-500"
                          : "text-amber-500")
                      }
                    >
                      {summary.title}
                    </p>
                    {summary.detail && (
                      <p className="text-xs">{summary.detail}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isPending || !formState.isValid}
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Ban user
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
