"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  BellPlus,
  Loader2,
  Store,
  UserPlus,
  Send,
  ShieldCheck,
  Loader,
  BadgeCheck,
  AlertCircle,
  Car,
  Compass,
  Plus,
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Provider, User } from "@/lib/all-types";
import { useParams } from "next/navigation";
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
import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard";
import { getUserById } from "@/actions/user.actions";
import { motion } from "framer-motion";
import { sendNotification } from "@/actions/notification.action";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getProvidersBySearch,
  setUserProvider,
} from "@/actions/provider.action";
import ThumbnailImage from "@/components/ThumbnailImage";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorState } from "./ErrorState";

const STAFF_ROLES = ["manager", "staff"] as const;
const ACCENT_STYLES = {
  violet: {
    border: "border-violet-500/30",
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
  },
  amber: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
  },
} as const;
const SERVICE_TYPE_COLORS = {
  transport: {
    style: "text-blue-600 dark:text-blue-400",
    icon: <Car className="h-3.5 w-3.5 text-blue-500" />,
  },
  experience: {
    style: "text-orange-600 dark:text-orange-400",
    icon: <Compass className="h-3.5 w-3.5 text-orange-500" />,
  },
} as const;

interface AssignProviderStaffDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned: () => void;
}

function AssignProviderStaffDialog({
  user,
  open,
  onOpenChange,
  onAssigned,
}: AssignProviderStaffDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Provider[]>([]);
  const [selected, setSelected] = useState<Provider | null>(null);
  const [staffRole, setStaffRole] =
    useState<(typeof STAFF_ROLES)[number]>("staff");
  const [isPending, startTransition] = useTransition();
  const debouncedSearch = useDebounce(query);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, startSearch] = useTransition();

  useEffect(() => {
    if (!open) return;

    startSearch(async () => {
      setError(null);
      const result = await getProvidersBySearch(debouncedSearch);

      if (!result.success) {
        setError(result.error);
        return;
      }
      const data = result.data as Provider[];

      setResults(data);
    });
  }, [debouncedSearch, open]);

  function reset() {
    setQuery("");
    setResults([]);
    setSelected(null);
    setStaffRole("staff");
  }

  function handleSubmit() {
    if (!selected) return;

    startTransition(async () => {
      const res = await setUserProvider("admin", {
        providerId: selected.id,
        role: staffRole,
        userId: user.id,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      toast.success(
        `${user.name} has been assigned to ${selected.name} as ${staffRole}.`,
      );
      onAssigned();
      onOpenChange(false);
      reset();
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
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15">
              <UserPlus className="size-4.5 text-violet-500" />
            </div>
            <DialogTitle>Assign as staff</DialogTitle>
          </div>
          <DialogDescription>
            Search for a provider and pick a role. They&apos;ll be added to that
            provider&apos;s team immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Operation Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Provider</Label>

            {selected ? (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex w-full items-center justify-between rounded-lg border border-violet-500/25 bg-violet-500/6 px-3 py-2 text-left text-sm"
              >
                <span className="flex items-center gap-2">
                  <Store size={14} className="text-violet-500" />
                  {selected.name}
                </span>
                <span className="text-xs text-slate-500">Change</span>
              </button>
            ) : (
              <Command className="rounded-md border">
                <CommandInput
                  placeholder="Search providers by name…"
                  value={query}
                  onValueChange={setQuery}
                />
                <CommandList>
                  {isSearching && (
                    <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-500">
                      <Loader2 className="size-3.5 animate-spin" />
                      Searching…
                    </div>
                  )}

                  {!isSearching && (
                    <CommandEmpty className="px-3 py-4 text-center text-xs text-slate-500">
                      {query
                        ? "No providers found."
                        : "Start typing to search providers."}
                    </CommandEmpty>
                  )}

                  <CommandGroup heading="Providers">
                    {results.map((provider: Provider) => (
                      <CommandItem
                        key={provider.id}
                        value={provider.name}
                        onSelect={() => setSelected(provider)}
                        className="cursor-pointer"
                      >
                        <ThumbnailImage
                          src={provider.logo}
                          alternative={provider.name}
                          className="rounded-full"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {provider.name}
                            </p>

                            <BadgeCheck className="size-4 text-green-500" />
                            <span className="capitalize text-muted-foreground text-xs">
                              ({provider.status})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-xs capitalize",
                                SERVICE_TYPE_COLORS[provider.serviceType].style,
                              )}
                            >
                              {SERVICE_TYPE_COLORS[provider.serviceType].icon}{" "}
                              {provider.serviceType}
                            </div>

                            <Badge
                              variant="outline"
                              className="font-normal capitalize"
                            >
                              {provider.businessType}
                            </Badge>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </div>

          <div className="space-y-2">
            <Label>Role at this provider</Label>
            <Select
              value={staffRole}
              onValueChange={(v) => setStaffRole(v as typeof staffRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
            type="button"
            onClick={handleSubmit}
            disabled={!selected || isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Assign as {staffRole}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = params.id as string;

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getUserById(userId);
        if (!mounted) return;

        if (!result.success || !result.data) {
          setError(result.error ?? "User not found.");
          return;
        }
        setUser(result.data as User);
      } catch {
        if (mounted) {
          setError("Something went wrong while loading the user.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (error)
    return (
      <ErrorState
        error={error}
        title="Unable to load user"
        description="The requested user could not be found or an unexpected error occurred while fetching the user details."
        fullScreen
      />
    );

  if (loading)
    return (
      <div className="flex min-h-[90dvh] flex-col items-center justify-center gap-4">
        <Loader className="size-7 animate-spin text-primary" />

        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold">Loading user data...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we retrieve the user's information.
          </p>
        </div>
      </div>
    );

  return (
    <div className="px-4 md:px-6 py-6 space-y-6 p-6">
      {user && <ProfileIdentityCard user={user} />}

      {user && <UserProviderReviewCard user={user} />}
    </div>
  );
}

function UserProviderReviewCard({ user }: { user: User }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isAlreadyProvider = user.role === "provider";
  const isAdmin = user.role === "admin";

  function handleNotify() {
    startTransition(async () => {
      const res = await sendNotification({
        title: "🎉 You're Invited to Join a Provider!",
        message:
          "You've been invited to join a provider. Visit the 'Become a Provider' page and submit your request to continue. Once you send your request, it will be reviewed and processed automatically.",
        recipient: "user",
        type: "provider_invite",
        recipientId: user.id,
      });

      if (!res.success) {
        toast.error("Failed to send the invitation.");
        return;
      }

      toast.success("Provider invitation sent successfully.");
    });
  }

  if (isAdmin) {
    return (
      <SectionShell>
        <QuietState
          icon={ShieldCheck}
          title="This is an admin account"
          detail="Provider conversion doesn't apply to admins."
        />
      </SectionShell>
    );
  }

  if (isAlreadyProvider) {
    return (
      <SectionShell>
        <QuietState
          icon={Store}
          title="Already a provider"
          detail="This user is already registered as a provider on Way Link."
        />
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold">Provider status</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            This user is a regular member. Choose how you&apos;d like to move
            them toward becoming a provider.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 grid-cols-2">
        <ActionCard
          icon={UserPlus}
          accent="violet"
          title="Assign as staff"
          description="Assign this user to an existing provider as a staff member. If they aren't already a member, the system will create the membership, update their account to a provider, and notify them to complete the provider onboarding process."
          action={
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAssignOpen(true)}
              disabled={isPending}
            >
              Assign to a provider
            </Button>
          }
        />

        <ActionCard
          icon={Send}
          accent="amber"
          title="Invite to apply"
          description="Send an invitation encouraging this user to submit a provider application. Once their request is submitted, it will enter the platform's review and approval process."
          action={
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setNotifyOpen(true)}
              disabled={isPending}
            >
              Send notification
            </Button>
          }
        />
      </div>

      <AssignProviderStaffDialog
        user={user}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssigned={() => {
          toast.success("Operation is Done");
        }}
      />

      <AlertDialog open={notifyOpen} onOpenChange={setNotifyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="capitalize">
              Send provider invitation to{" "}
              <span className="text-orange-1 underline">{user.name}</span>?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They&apos;ll get a notification pointing them to the{" "}
              <span className="underline text-amber-500">
                become-a-provider page
              </span>
              , where they can submit their own request. No changes are made to
              their account yet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleNotify}>
              <BellPlus className="size-4" />
              Send invite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionShell>
  );
}

function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-md border p-5"
    >
      {children}
    </motion.div>
  );
}

function QuietState({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof ShieldCheck;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={25} className="text-muted-foreground" />
      <div>
        <p className="text-base font-medium text-neutral-800 dark:text-neutral-200">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  accent,
  title,
  description,
  action,
}: {
  icon: typeof UserPlus;
  accent: keyof typeof ACCENT_STYLES;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}>
      <Icon size={19} className={styles.icon} />
      <p className="mt-2 text-base font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-3">{action}</div>
    </div>
  );
}
