"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn, fmtDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  PowerOff,
  BadgeCheck,
  ArrowRight,
  RefreshCcw,
  Mail,
  Building2,
  Phone,
  MapPin,
  Briefcase,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import {
  BusinessType,
  Provider,
  ProviderStatus,
  ServiceType,
} from "@/lib/all-types";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; provider: Provider | null };

const STATUS_CONFIG: Record<
  ProviderStatus,
  { label: string; className: string; dotClassName: string }
> = {
  pending: {
    label: "Pending review",
    className:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    dotClassName: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    className:
      "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    dotClassName: "bg-green-500",
  },
  suspended: {
    label: "Suspended",
    className:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    dotClassName: "bg-zinc-400",
  },
  inactive: {
    label: "Inactive",
    className:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    dotClassName: "bg-zinc-400",
  },
};

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  transport: "Transport",
  experience: "Experience",
};

const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  individual: "Individual",
  company: "Company",
  agency: "Agency",
};

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full mt-4" />
        <Skeleton className="h-3.5 w-3/4 mt-1.5" />
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="size-12 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center justify-center">
          <AlertTriangle className="size-5 text-red-500" />
        </div>
        <div>
          <p className="text-[15px] font-semibold">Something went wrong</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
            {message}
          </p>
        </div>
        <Button variant="outline" onClick={onRetry} className="gap-2 mt-1">
          <RefreshCcw className="size-3.5" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ProviderStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 text-xs font-medium", config.className)}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </Badge>
  );
}

function ProviderAvatar({ provider }: { provider: Provider }) {
  const initials = provider.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (provider.logo) {
    return (
      <img
        src={provider.logo}
        alt={provider.name}
        className="size-10 rounded-md object-cover border border-border"
      />
    );
  }

  return (
    <div className="size-10 rounded-md bg-muted border border-border flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
      {initials}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-sm text-foreground font-medium truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  dimmed = false,
}: {
  provider: Provider;
  dimmed?: boolean;
}) {
  return (
    <Card className={cn("transition-opacity", dimmed && "opacity-60")}>
      {provider.cover && (
        <div className="h-24 w-full overflow-hidden rounded-t-lg">
          <img
            src={provider.cover}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <ProviderAvatar provider={provider} />
            <div>
              <p className="text-[15px] font-semibold leading-tight">
                {provider.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {provider.slug} · {SERVICE_TYPE_LABELS[provider.serviceType]}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={provider.status} />
            {provider.isVerified && (
              <Badge
                variant="outline"
                className="gap-1 text-[11px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
              >
                <BadgeCheck className="size-3" />
                Verified
              </Badge>
            )}
          </div>
        </div>
        {provider.description && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-3 pb-1">
            {provider.description}
          </p>
        )}
        <Separator className="mt-3" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoRow
            icon={Building2}
            label="Business type"
            value={BUSINESS_TYPE_LABELS[provider.businessType]}
          />
          <InfoRow
            icon={Briefcase}
            label="Service type"
            value={SERVICE_TYPE_LABELS[provider.serviceType]}
          />
          <InfoRow icon={Mail} label="Email" value={provider.businessEmail} />
          <InfoRow icon={Phone} label="Phone" value={provider.businessPhone} />
          {provider.address && (
            <div className="col-span-2">
              <InfoRow icon={MapPin} label="Address" value={provider.address} />
            </div>
          )}
          <InfoRow
            icon={CalendarDays}
            label="Submitted"
            value={fmtDate(provider.createdAt)}
          />
          {provider.status === "approved" && (
            <InfoRow
              icon={CalendarDays}
              label="Approved on"
              value={fmtDate(provider.updatedAt)}
            />
          )}
          {(provider.status === "suspended" ||
            provider.status === "inactive") && (
            <InfoRow
              icon={CalendarDays}
              label={
                provider.status === "suspended"
                  ? "Suspended on"
                  : "Deactivated on"
              }
              value={fmtDate(provider.updatedAt)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onRequest }: { onRequest: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="size-12 rounded-lg bg-muted border border-border flex items-center justify-center">
          <Briefcase className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[15px] font-semibold">No provider request yet</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">
            You haven't applied to become a provider. Start the process to offer
            your services on the platform.
          </p>
        </div>
        <Button onClick={onRequest} className="mt-1 gap-2">
          Become a provider
          <ArrowRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

function PendingState({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-3">
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <Clock className="size-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm">
          Your request is under review. We typically respond within 2–3 business
          days. You'll be notified by email once a decision is made.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <ProviderAvatar provider={provider} />
              <div>
                <p className="text-[15px] font-semibold leading-tight">
                  {provider.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {provider.slug} · {SERVICE_TYPE_LABELS[provider.serviceType]}
                </p>
              </div>
            </div>
            <StatusBadge status="pending" />
          </div>
          {provider.description && (
            <p className="text-sm text-muted-foreground leading-relaxed pt-3">
              {provider.description}
            </p>
          )}
          <Separator className="mt-3" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow
              icon={Building2}
              label="Business type"
              value={BUSINESS_TYPE_LABELS[provider.businessType]}
            />
            <InfoRow
              icon={Briefcase}
              label="Service type"
              value={SERVICE_TYPE_LABELS[provider.serviceType]}
            />
            <InfoRow icon={Mail} label="Email" value={provider.businessEmail} />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={provider.businessPhone}
            />
            {provider.address && (
              <div className="col-span-2">
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={provider.address}
                />
              </div>
            )}
            <InfoRow
              icon={CalendarDays}
              label="Submitted"
              value={fmtDate(provider.createdAt)}
            />
          </div>

          <Separator className="my-4" />
          <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground mb-3">
            Request timeline
          </p>
          <div className="flex flex-col">
            {(
              [
                {
                  label: "Request submitted",
                  time: fmtDate(provider.createdAt),
                  state: "done",
                },
                {
                  label: "Under admin review",
                  time: "In progress",
                  state: "active",
                },
                { label: "Decision", time: "Awaiting", state: "idle" },
              ] as const
            ).map((step, i, arr) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center w-4 shrink-0">
                  <div
                    className={cn("size-2 rounded-full mt-1.5 shrink-0", {
                      "bg-green-500": step.state === "done",
                      "bg-amber-500 ring-2 ring-amber-200 dark:ring-amber-900":
                        step.state === "active",
                      "bg-border": step.state === "idle",
                    })}
                  />
                  {i < arr.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-4" />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className={cn("text-sm font-medium", {
                      "text-foreground": step.state !== "idle",
                      "text-muted-foreground font-normal":
                        step.state === "idle",
                    })}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {step.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ApprovedState({
  provider,
  onStartBusiness,
}: {
  provider: Provider;
  onStartBusiness: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 flex-row items-center justify-between gap-3 flex">
        <div className="flex items-start gap-2 flex-1">
          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <AlertDescription className="text-green-800 dark:text-green-300 text-sm">
            <span className="font-semibold">
              Your provider account is approved!
            </span>{" "}
            You can now access your provider dashboard and start managing your
            services.
          </AlertDescription>
        </div>
        <Button
          onClick={onStartBusiness}
          size="sm"
          className="shrink-0 bg-green-600 hover:bg-green-700 cursor-pointer text-white gap-1.5"
        >
          Start your business
          <ArrowRight className="size-3.5" />
        </Button>
      </Alert>
      <ProviderCard provider={provider} />
    </div>
  );
}

// function RejectedState({
//   provider,
//   onResubmit,
// }: {
//   provider: Provider;
//   onResubmit: () => void;
// }) {
//   return (
//     <div className="flex flex-col gap-3">
//       <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
//         <XCircle className="size-4 text-red-600 dark:text-red-400" />
//         <AlertDescription className="text-red-800 dark:text-red-300 text-sm">
//           <span className="font-semibold">Your request was not approved.</span>{" "}
//           We couldn't verify the information provided. Review your details and
//           submit a new request.
//         </AlertDescription>
//       </Alert>
//       <Card>
//         <CardHeader className="pb-0">
//           <div className="flex items-start justify-between gap-3">
//             <div className="flex items-center gap-3">
//               <ProviderAvatar provider={provider} />
//               <div>
//                 <p className="text-[15px] font-semibold leading-tight">
//                   {provider.name}
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-0.5">
//                   {provider.slug} · {SERVICE_TYPE_LABELS[provider.serviceType]}
//                 </p>
//               </div>
//             </div>
//             <StatusBadge status="rejected" />
//           </div>
//           <Separator className="mt-3" />
//         </CardHeader>
//         <CardContent className="pt-4">
//           <div className="grid grid-cols-2 gap-x-6 gap-y-4">
//             <InfoRow
//               icon={Building2}
//               label="Business type"
//               value={BUSINESS_TYPE_LABELS[provider.businessType]}
//             />
//             <InfoRow
//               icon={Briefcase}
//               label="Service type"
//               value={SERVICE_TYPE_LABELS[provider.serviceType]}
//             />
//             <InfoRow
//               icon={CalendarDays}
//               label="Submitted"
//               value={fmt(provider.createdAt)}
//             />
//             <InfoRow
//               icon={CalendarDays}
//               label="Reviewed"
//               value={fmt(provider.updatedAt)}
//             />
//           </div>

//           <Separator className="my-4" />
//           <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground mb-2">
//             Admin note
//           </p>
//           <div className="bg-muted rounded-md border border-border px-3 py-2.5 text-sm text-muted-foreground leading-relaxed">
//             We were unable to verify your business information based on the
//             documents provided. Please ensure that your business registration
//             and tax information are accurate and up to date before resubmitting
//             your application.
//           </div>
//         </CardContent>
//         <CardFooter>
//           <Button onClick={onResubmit} className="w-full gap-2">
//             <RefreshCcw className="size-3.5" />
//             Resubmit request
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

function SuspendedState({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-3">
      <Alert className="border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        <PauseCircle className="size-4 text-zinc-500" />
        <AlertDescription className="text-zinc-700 dark:text-zinc-300 text-sm">
          <span className="font-semibold">Account suspended.</span> Access to
          your provider dashboard is temporarily restricted.{" "}
          <a
            href="mailto:support@platform.com"
            className="underline underline-offset-2 font-medium"
          >
            Contact support
          </a>{" "}
          if you believe this is a mistake.
        </AlertDescription>
      </Alert>
      <ProviderCard provider={provider} dimmed />
    </div>
  );
}

function InactiveState({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col gap-3">
      <Alert className="border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        <PowerOff className="size-4 text-zinc-500" />
        <AlertDescription className="text-zinc-700 dark:text-zinc-300 text-sm">
          <span className="font-semibold">
            Your provider account is inactive.
          </span>{" "}
          Your profile is no longer visible to customers. Reactivate to resume
          your services.
        </AlertDescription>
      </Alert>
      <ProviderCard provider={provider} dimmed />
    </div>
  );
}

export function ProviderRequest() {
  const router = useRouter();
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<FetchState>({ status: "loading" });

  useEffect(() => {
    const getProvider = async () => {
      const mainUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      setState({ status: "loading" });
      try {
        const res = await fetch(`${mainUrl}/api/user/provider`);
        if (!res.ok) {
          throw new Error("Failed to fetch provider");
        }

        const data = await res.json();

        setState({ status: "success", provider: data.data });
      } catch (error) {
        const errMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setState({ status: "error", message: errMessage });
      }
    };

    getProvider();
  }, [retryKey]);

  if (state.status === "idle" || state.status === "loading") {
    return <LoadingSkeleton />;
  }

  if (state.status === "error") {
    return (
      <ErrorState
        message={state.message}
        onRetry={() => setRetryKey((prev) => prev + 1)}
      />
    );
  }

  const { provider } = state;

  if (!provider) {
    return <EmptyState onRequest={() => router.push("/become-provider")} />;
  }

  switch (provider.status) {
    case "pending":
      return <PendingState provider={provider} />;

    case "approved":
      return (
        <ApprovedState
          provider={provider}
          onStartBusiness={() => router.push("/provider")}
        />
      );

    case "suspended":
      return <SuspendedState provider={provider} />;

    case "inactive":
      return <InactiveState provider={provider} />;

    default:
      return null;
  }
}
