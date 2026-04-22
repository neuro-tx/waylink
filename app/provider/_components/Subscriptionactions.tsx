"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  XCircle,
  Zap,
  PlayCircle,
  ExternalLink,
  CreditCard,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Pause,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { PlanBillingCycle, SubscriptionStatus } from "@/lib/all-types";
import {
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  subscribeToPlan,
} from "@/actions/plans.action";

type ActionKey =
  | "cancel"
  | "expire"
  | "resubscribe"
  | "viewPlans"
  | "pause"
  | "resume";
type ColorIntent = "emerald" | "amber" | "red" | "muted";

interface ActionConfig {
  key: ActionKey;
  label: string;
  icon: React.ElementType;
  color: ColorIntent;
  dialog: {
    title: string;
    description: string;
    confirmLabel: string;
    confirmColor: ColorIntent;
  };
}

interface FeedbackState {
  type: "success" | "error";
  title: string;
  description: string;
}

interface SubscriptionActionsProps {
  subId: string;
  status: SubscriptionStatus | undefined;
  planId: string;
  billingCycle?: PlanBillingCycle;
}

const ACTION_MATRIX: Record<SubscriptionStatus, ActionKey[]> = {
  active: ["cancel", "expire", "pause"],
  trialing: ["cancel", "expire"],
  paused: ["resume", "expire"],
  cancelled: ["expire", "resubscribe"],
  expired: ["viewPlans", "resubscribe"],
};

const ACTION_CONFIG: Record<ActionKey, ActionConfig> = {
  cancel: {
    key: "cancel",
    label: "Cancel",
    icon: XCircle,
    color: "amber",
    dialog: {
      title: "Cancel Subscription",
      description:
        "Your subscription will remain active until the end of the billing period. You will not be charged again.",
      confirmLabel: "Cancel Subscription",
      confirmColor: "amber",
    },
  },
  expire: {
    key: "expire",
    label: "Expire Now",
    icon: Zap,
    color: "red",
    dialog: {
      title: "End Subscription Immediately",
      description:
        "This will immediately terminate your subscription and remove access to all premium features.",
      confirmLabel: "Expire Now",
      confirmColor: "red",
    },
  },
  resubscribe: {
    key: "resubscribe",
    label: "Resubscribe",
    icon: CreditCard,
    color: "emerald",
    dialog: {
      title: "Confirm New Subscription",
      description:
        "You are about to start a new subscription. This action will immediately create a new plan and may result in charges. This cannot be undone.",
      confirmLabel: "Confirm & Subscribe",
      confirmColor: "emerald",
    },
  },
  viewPlans: {
    key: "viewPlans",
    label: "View Plans",
    icon: ExternalLink,
    color: "muted",
    dialog: {
      title: "View Available Plans",
      description:
        "Browse our plans and choose the one that fits your business needs.",
      confirmLabel: "View Plans",
      confirmColor: "muted",
    },
  },
  pause: {
    key: "pause",
    label: "Pause",
    icon: Pause,
    color: "amber",
    dialog: {
      title: "Pause Subscription",
      description:
        "Your subscription will be paused and you may lose access to premium features until you resume it.",
      confirmLabel: "Pause",
      confirmColor: "amber",
    },
  },
  resume: {
    key: "resume",
    label: "Resume",
    icon: PlayCircle,
    color: "emerald",
    dialog: {
      title: "Resume Subscription",
      description:
        "Your subscription will be reactivated and billing will continue as normal.",
      confirmLabel: "Resume",
      confirmColor: "emerald",
    },
  },
};

const BTN_COLOR: Record<ColorIntent, string> = {
  emerald: cn(
    "bg-emerald-500 text-white dark:bg-emerald-600",
    "shadow-sm dark:shadow-none dark:ring-1 dark:ring-emerald-700",
  ),
  amber: cn(
    "bg-amber-500 text-white dark:bg-amber-600",
    "shadow-sm dark:shadow-none dark:ring-1 dark:ring-amber-700",
  ),
  red: cn(
    "bg-red-500 text-white dark:bg-red-600",
    "shadow-sm dark:shadow-none dark:ring-1 dark:ring-red-700",
  ),
  muted: cn(
    "bg-muted text-foreground hover:bg-muted/80",
    "shadow-sm dark:shadow-none dark:ring-1 dark:ring-border",
  ),
};

const CONFIRM_COLOR: Record<ColorIntent, string> = {
  emerald:
    "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 border-0",
  amber:
    "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 border-0",
  red: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 border-0",
  muted: "bg-muted text-foreground hover:bg-muted/80 border-0",
};

const ICON_BG: Record<ColorIntent, string> = {
  emerald:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  red: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",
  muted: "bg-muted text-muted-foreground",
};

const SUCCESS_MESSAGES: Partial<Record<ActionKey, string>> = {
  cancel: "Subscription cancelled. Access continues until the period end.",
  expire: "Subscription ended immediately.",
  pause: "Subscription paused successfully.",
  resume: "Subscription resumed successfully.",
};

function ActionButton({
  config,
  onClick,
  disabled,
}: {
  config: ActionConfig;
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md",
        "text-sm font-medium transition-all duration-200 shrink-0 flex-nowrap whitespace-nowrap",
        "disabled:opacity-50 hover:opacity-90 disabled:cursor-auto",
        BTN_COLOR[config.color],
      )}
    >
      <Icon className="size-4 shrink-0" />
      {config.label}
    </button>
  );
}

function ConfirmDialog({
  config,
  open,
  isPending,
  onConfirm,
  onClose,
}: {
  config: ActionConfig;
  open: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const Icon = config.icon;
  const { dialog } = config;
  const isDestructive = dialog.confirmColor === "red";

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && !v && onClose()}>
      <DialogContent className="sm:max-w-sm gap-4">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-9 rounded-xl flex items-center justify-center shrink-0",
                ICON_BG[dialog.confirmColor],
              )}
            >
              <Icon className="size-4" />
            </div>
            <DialogTitle className="text-base leading-tight">
              {dialog.title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {dialog.description}
          </DialogDescription>
        </DialogHeader>

        {isDestructive && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3.5 py-3">
            <AlertTriangle className="size-3.5 text-red-500 shrink-0 mt-px" />
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
              This action cannot be undone. All active listings will be
              immediately deactivated.
            </p>
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
              "bg-transparent border border-border text-muted-foreground",
              "hover:bg-muted/50 hover:text-foreground disabled:opacity-50 disabled:cursor-auto",
            )}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "px-4 py-2 rounded-md text-sm font-medium cursor-pointer",
              "transition-all duration-200 disabled:opacity-70 disabled:cursor-auto",
              CONFIRM_COLOR[dialog.confirmColor],
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Processing…
              </>
            ) : (
              dialog.confirmLabel
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubscriptionActions({
  subId,
  status,
  planId,
  billingCycle,
}: SubscriptionActionsProps) {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState<ActionKey | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const isActive = status === "active";

  if (!status || !(status in ACTION_MATRIX)) return null;

  const visibleKeys = ACTION_MATRIX[status];
  const activeConfig = activeKey ? ACTION_CONFIG[activeKey] : null;

  function close() {
    if (!isPending) setActiveKey(null);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 6000);

    return () => clearTimeout(timer);
  }, [feedback]);

  function handleConfirm() {
    if (!activeKey) return;

    if (activeKey === "viewPlans") {
      router.push("/provider/plans");
      setActiveKey(null);
      return;
    }

    startTransition(async () => {
      let result: { success: boolean; error?: string } | undefined;

      switch (activeKey) {
        case "cancel":
          result = await cancelSubscription(subId, false);
          break;

        case "expire":
          result = await cancelSubscription(subId, true);
          break;

        case "pause":
          result = await pauseSubscription();
          break;

        case "resume":
          result = await resumeSubscription();
          break;

        case "resubscribe":
          result = await subscribeToPlan({
            planId,
            billingCycle,
          });
          break;
      }

      setActiveKey(null);

      if (result && !result.success) {
        setFeedback({
          type: "error",
          title: "Something went wrong",
          description: result.error ?? "Please try again.",
        });
        return;
      }

      setFeedback({
        type: "success",
        title: "Done",
        description: SUCCESS_MESSAGES[activeKey] ?? "Action completed.",
      });

      router.refresh();
    });
  }

  const disableSubBtn = activeKey === "resubscribe" && isActive;

  return (
    <>
      <div className="px-5 py-4 border-t border-border/50 space-y-3">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Actions
        </p>

        {feedback && (
          <Alert
            variant={feedback.type === "error" ? "destructive" : "default"}
            className={cn(
              "py-3",
              feedback.type === "success" &&
                "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 [&>svg]:text-emerald-500 fade-in",
            )}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
            <AlertTitle
              className={cn(
                "text-xs font-medium",
                feedback.type === "success" &&
                  "text-emerald-800 dark:text-emerald-200",
              )}
            >
              {feedback.title}
            </AlertTitle>
            <AlertDescription
              className={cn(
                "text-xs",
                feedback.type === "success"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground",
              )}
            >
              {feedback.description}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleKeys.map((key) => (
            <ActionButton
              key={key}
              config={ACTION_CONFIG[key]}
              onClick={() => {
                setFeedback(null);
                setActiveKey(key);
              }}
              disabled={isPending}
            />
          ))}
        </div>
      </div>

      {activeConfig && (
        <ConfirmDialog
          config={activeConfig}
          open={activeKey !== null}
          isPending={isPending}
          onConfirm={handleConfirm}
          onClose={close}
        />
      )}
    </>
  );
}
