"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProviderContext } from "@/components/providers/ProviderContext";
import {
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { updateServicesStatus } from "@/actions/service.action";
import { actionTransitions } from "@/lib/helpers";

type Status = "draft" | "active" | "paused" | "archived";
export type SelectedItem = {
  id: string;
  status: Status;
};

type BulkUpdatePayload = {
  id: string;
  status: Status;
}[];

type FailedServiceDetail = {
  title: string;
  error: string;
};

interface ServiceActionsProps {
  selected: Map<string, SelectedItem>;
  total: number;
  selectAll: () => void;
  clearSelection: () => void;
  onSuccess?: (updatedIds: string[], newStatus: Status) => void;
}

type ActionResult =
  | { success: true; updated: number }
  | {
      success: false;
      error: string;
      details?: Record<string, FailedServiceDetail>;
    };

const statusActions: Record<
  Exclude<Status, "draft">,
  { label: string; className: string }
> = {
  active: {
    label: "Activate",
    className:
      "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10",
  },
  paused: {
    label: "Pause",
    className: "text-muted-foreground border-border hover:bg-muted",
  },
  archived: {
    label: "Archive",
    className: "text-destructive border-destructive/30 hover:bg-destructive/10",
  },
};

type ResultDialogProps = {
  open: boolean;
  onClose: () => void;
  result: ActionResult | null;
  targetStatus: Exclude<Status, "draft"> | null;
  totalRequested: number;
};

function ResultDialog({
  open,
  onClose,
  result,
  targetStatus,
  totalRequested,
}: ResultDialogProps) {
  if (!result) return null;

  const [detailsOpen, setDetailsOpen] = useState(true);
  const isFullSuccess = result.success;
  const isPartial =
    !result.success &&
    "details" in result &&
    result.details &&
    totalRequested > 1;

  const successCount = isFullSuccess
    ? result.updated
    : isPartial
      ? totalRequested - Object.keys(result.details!).length
      : 0;

  const failedEntries = result.success
    ? []
    : Object.entries(result.details ?? {});

  const statusLabel = targetStatus
    ? (statusActions[targetStatus]?.label ?? targetStatus)
    : "";
    
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <div
          className={cn(
            "p-4",
            isFullSuccess
              ? "bg-emerald-500/8 border-b border-emerald-500/15"
              : isPartial
                ? "bg-amber-500/8 border-b border-amber-500/15"
                : "bg-destructive/8 border-b border-destructive/15",
          )}
        >
          <AlertDialogHeader className="gap-2">
            <div className="flex items-center gap-3">
              {isFullSuccess ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              ) : isPartial ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/15">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
              )}

              <AlertDialogTitle className="text-base leading-tight">
                {isFullSuccess
                  ? `${successCount} service${successCount !== 1 ? "s" : ""} ${statusLabel.toLowerCase()}d`
                  : isPartial
                    ? "Partially completed"
                    : "Update failed"}
              </AlertDialogTitle>
            </div>

            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {isFullSuccess
                ? `All ${successCount} selected service${successCount !== 1 ? "s were" : " was"} successfully set to ${targetStatus}.`
                : result.error}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="p-4 space-y-4">
          {isPartial && (
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/6 px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Updated</p>
                  <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {successCount} service{successCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-lg border border-destructive/20 bg-destructive/6 px-3 py-2.5">
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="text-sm font-semibold tabular-nums text-destructive">
                    {failedEntries.length} service
                    {failedEntries.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}

          {failedEntries.length > 0 && (
            <div className="rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setDetailsOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                <span>
                  {failedEntries.length} issue
                  {failedEntries.length !== 1 ? "s" : ""} to review
                </span>
                {detailsOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="border-t border-border max-h-52 overflow-y-auto">
                      {failedEntries.map(([id, detail]) => (
                        <li
                          key={id}
                          className="flex items-start gap-3 px-3 py-2.5"
                        >
                          <XCircle className="h-3.5 w-3.5 mt-1 shrink-0 text-destructive/70" />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">
                              {detail.title}
                            </span>
                            <span className="text-xs text-destructive leading-snug">
                              {detail.error}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <AlertDialogFooter className="px-4 pb-4">
          <AlertDialogAction
            onClick={onClose}
            className={cn(
              "w-full",
              isFullSuccess
                ? "bg-emerald-600! hover:bg-emerald-700!"
                : isPartial
                  ? "bg-amber-500! hover:bg-amber-600!"
                  : "",
            )}
            variant="outline"
          >
            {isFullSuccess ? "Done" : isPartial ? "Got it" : "Dismiss"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const ServiceActions = ({
  selected,
  total,
  selectAll,
  clearSelection,
  onSuccess,
}: ServiceActionsProps) => {
  const { config } = useProviderContext();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogResult, setDialogResult] = useState<ActionResult | null>(null);
  const [dialogTargetStatus, setDialogTargetStatus] = useState<Exclude<
    Status,
    "draft"
  > | null>(null);

  const isSingle = selected.size === 1;
  const selectedItem = isSingle ? Array.from(selected.values())[0] : null;

  const availableActions: Exclude<Status, "draft">[] =
    isSingle && selectedItem
      ? actionTransitions[selectedItem.status]
      : ["active", "paused", "archived"];

  const handleStatusChange = (targetStatus: Exclude<Status, "draft">) => {
    startTransition(async () => {
      const payload: BulkUpdatePayload = Array.from(selected.values()).map(
        (item) => ({ id: item.id, status: targetStatus }),
      );

      const result = await updateServicesStatus("provider", payload);
      setDialogTargetStatus(targetStatus);
      setDialogResult(result as ActionResult);
      setDialogOpen(true);

      if (result.success) {
        onSuccess?.(
          payload.map((p) => p.id),
          targetStatus,
        );
      } else if ("details" in result && result.details) {
        const failedIds = new Set(Object.keys(result.details));
        const succeededIds = payload
          .map((p) => p.id)
          .filter((id) => !failedIds.has(id));
        if (succeededIds.length > 0) {
          onSuccess?.(succeededIds, targetStatus);
        }
      }
    });
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogResult) clearSelection();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border mb-4"
        style={{
          borderColor: `color-mix(in srgb, ${config.themeColor} 20%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${config.themeColor} 6%, transparent)`,
        }}
      >
        <span
          className={cn("text-sm font-medium tabular-nums", config.twTextColor)}
        >
          {selected.size} selected
        </span>

        {selected.size < total && (
          <button
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Select all {total}
          </button>
        )}

        {isSingle && selectedItem && (
          <span className="text-xs text-muted-foreground/60 hidden sm:inline">
            Current:{" "}
            <span className="capitalize font-medium text-muted-foreground">
              {selectedItem.status}
            </span>
          </span>
        )}

        <div className="flex-1" />

        {isPending && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
        )}

        {availableActions.map((status) => {
          const cfg = statusActions[status];
          return (
            <button
              key={status}
              disabled={isPending}
              onClick={() => handleStatusChange(status)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                cfg.className,
              )}
            >
              {cfg.label}
            </button>
          );
        })}

        <button
          onClick={clearSelection}
          className="text-muted-foreground hover:text-foreground ml-1 cursor-pointer transition-colors"
          aria-label="Clear selection"
        >
          <X className="size-3" />
        </button>
      </motion.div>

      <ResultDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        result={dialogResult}
        targetStatus={dialogTargetStatus}
        totalRequested={selected.size}
      />
    </>
  );
};

export default ServiceActions;
