"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SubscriptionStatus } from "@/lib/all-types";

export type HandleSubscriptionsResult =
  | {
      success: boolean;
      message: string;
      completed: number;
      failed: number;
      errors: string[];
      error?: never;
    }
  | {
      success: true;
      message?: string;
      completed?: never;
      failed?: never;
      errors?: never;
      error?: never;
    }
  | {
      success: false;
      error: string;
      message?: never;
      completed?: never;
      failed?: never;
      errors?: never;
    };

export interface SubscriptionActionResultState {
  result: HandleSubscriptionsResult;
  totalSubmitted: number;
  targetStatus: SubscriptionStatus;
  targetLabel: string;
}

interface Props {
  state: SubscriptionActionResultState | null;
  onClose: () => void;
}

function StatPill({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant: "success" | "danger" | "neutral";
}) {
  const styles = {
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    danger: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    neutral: "bg-muted text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "rounded-xl px-5 py-3 flex flex-col items-center gap-1",
        styles[variant],
      )}
    >
      <span className="text-2xl font-semibold tabular-nums leading-none">
        {value}
      </span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Copy errors to clipboard"
    >
      {copied ? (
        <Check className="size-3 text-emerald-500" />
      ) : (
        <Copy className="size-3" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function SubscriptionActionResultDialog({ state, onClose }: Props) {
  const [errorsExpanded, setErrorsExpanded] = useState(false);
  if (!state) return null;

  const { result, totalSubmitted, targetLabel } = state;
  const isBulk = totalSubmitted > 1;

  // Determine overall outcome
  const isFullSuccess =
    result.success && (result.failed === undefined || result.failed === 0);
  const isPartial =
    !result.success && result.completed !== undefined && result.completed > 0;
  const isFullFailure = !result.success && !isPartial;

  // Collect error lines
  const errorLines: string[] =
    result.errors ?? (result.error ? [result.error] : []);
  const hasErrors = errorLines.length > 0;

  const scheme = isFullSuccess
    ? {
        icon: CheckCircle2,
        iconClass: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-900",
      }
    : isPartial
      ? {
          icon: AlertTriangle,
          iconClass: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-950/30",
          border: "border-amber-200 dark:border-amber-900",
        }
      : {
          icon: XCircle,
          iconClass: "text-destructive",
          bg: "bg-destructive/5 dark:bg-destructive/10",
          border: "border-destructive/20",
        };

  const Icon = scheme.icon;

  const headline = isFullSuccess
    ? isBulk
      ? `All ${result.completed ?? totalSubmitted} subscriptions updated`
      : `Subscription updated to ${targetLabel}`
    : isPartial
      ? `${result.completed} of ${totalSubmitted} subscriptions updated`
      : (result.error ??
        `Failed to update subscription${totalSubmitted > 1 ? "s" : ""}`);

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <div
          className={cn(
            "flex flex-col items-center gap-3 px-6 pt-7 pb-5",
            scheme.bg,
          )}
        >
          <div
            className={cn(
              "rounded-full size-10 border",
              scheme.border,
              scheme.bg,
              "grid place-items-center shrink-0"
            )}
          >
            <Icon
              className={cn("size-6", scheme.iconClass)}
              aria-hidden="true"
            />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground leading-snug">
              {headline}
            </p>
            {result.message && result.message !== headline && (
              <p className="text-xs text-muted-foreground mt-1">
                {result.message}
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {isBulk && result.completed !== undefined && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <StatPill
                  value={totalSubmitted}
                  label="Submitted"
                  variant="neutral"
                />
                <StatPill
                  value={result.completed}
                  label="Succeeded"
                  variant="success"
                />
                <StatPill
                  value={result.failed ?? 0}
                  label="Failed"
                  variant={result.failed ? "danger" : "neutral"}
                />
              </div>
              <Separator />
            </>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status applied</span>
            <span className="font-medium text-foreground">{targetLabel}</span>
          </div>

          {hasErrors && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/5 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => setErrorsExpanded((v) => !v)}
                aria-expanded={errorsExpanded}
              >
                <span className="flex items-center gap-1.5">
                  <XCircle className="size-3.5 shrink-0" aria-hidden="true" />
                  {errorLines.length} error{errorLines.length > 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2">
                  <CopyButton text={errorLines.join("\n")} />
                  {errorsExpanded ? (
                    <ChevronUp className="size-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="size-3.5" aria-hidden="true" />
                  )}
                </div>
              </button>

              {errorsExpanded && (
                <ScrollArea className="max-h-36">
                  <div className="px-3 pb-3 flex flex-col gap-1">
                    {errorLines.map((line, i) => {
                      const [id, ...rest] = line.split(": ");
                      return (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="font-mono text-muted-foreground shrink-0 pt-px">
                            {id}
                          </span>
                          <span className="text-destructive/80">
                            {rest.join(": ")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-5">
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
