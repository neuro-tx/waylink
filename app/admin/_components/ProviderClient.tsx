"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BadgeCheck,
  Building2,
  Car,
  Compass,
  Info,
  Loader2,
  MoreVertical,
  Search,
  User,
  AlertCircle,
  X,
} from "lucide-react";
import {
  BusinessType,
  Provider,
  ProviderStatus,
  ServiceType,
} from "@/lib/all-types";
import { fmtDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  ACTION_META,
  ConfirmDialog,
  EmptyState,
  ProviderAvatar,
  StatusBadge,
  TableRowSkeleton,
} from "./ProviderLayout";

type ActionType =
  | "approve"
  | "suspend"
  | "reject"
  | "reactivate"
  | "verify"
  | "view";

const STATUS_TABS: { key: ProviderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "inactive", label: "Inactive" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];
type ConfirmState = {
  open: boolean;
  provider: Provider | null;
  action: Exclude<ActionType, "view"> | null;
};

function getAvailableActions(p: Provider): ActionType[] {
  const actions: ActionType[] = ["view"];
  if (p.status === "pending") actions.push("approve", "reject");
  if (p.status === "approved") actions.push("suspend");
  if (p.status === "suspended" || p.status === "inactive")
    actions.push("reactivate");
  if (!p.isVerified && p.status === "approved") actions.push("verify");
  return actions;
}

const BUSINESS_TYPE_ICON: Record<BusinessType, React.ReactNode> = {
  individual: <User className="h-3 w-3" />,
  company: <Building2 className="h-3 w-3" />,
  agency: <Compass className="h-3 w-3" />,
};

const SERVICE_TYPE_ICON: Record<ServiceType, React.ReactNode> = {
  transport: <Car className="h-3.5 w-3.5" />,
  experience: <Compass className="h-3.5 w-3.5" />,
};

export default function ProviderClient() {
  const [activeTab, setActiveTab] = useState<ProviderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">(
    "all",
  );
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    provider: null,
    action: null,
  });
  const router = useRouter();

  const handleAction = useCallback((p: Provider, action: ActionType) => {
    if (action === "view") {
      router.push(`/admin/provider_management/${p.id}?slug=${p.slug}`);
      return;
    }

    setConfirm({
      open: true,
      provider: p,
      action: action as Exclude<ActionType, "view">,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirm.provider || !confirm.action) return;
    const { provider, action } = confirm;
    const key = `${provider.id}-${action}`;
    setLoadingAction(key);
    setError(null);

    try {
      await new Promise<void>((res, rej) =>
        setTimeout(() => (Math.random() > 0.12 ? res() : rej()), 1100),
      );
      setConfirm({ open: false, provider: null, action: null });
    } catch {
      setError(
        `Failed to ${ACTION_META[action].label.toLowerCase()} "${provider.name}". Please try again.`,
      );
      setConfirm({ open: false, provider: null, action: null });
    } finally {
      setLoadingAction(null);
    }
  }, [confirm]);

  const handleCancelConfirm = useCallback(() => {
    if (loadingAction) return;
    setConfirm({ open: false, provider: null, action: null });
  }, [loadingAction]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Providers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              providers registered on Way Link
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            {(["all", "transport", "experience"] as const).map((s) => (
              <Button
                key={s}
                variant={serviceFilter === s ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setServiceFilter(s)}
              >
                {s !== "all" && SERVICE_TYPE_ICON[s as ServiceType]}
                <span className="capitalize">
                  {s === "all" ? "All types" : s}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 text-destructive hover:text-destructive"
                onClick={() => setError(null)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ProviderStatus | "all")}
          >
            <TabsList className="h-auto p-1 flex-wrap gap-0.5">
              {STATUS_TABS.map(({ key, label }) => {
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="text-xs h-7 gap-1.5 data-[state=active]:bg-background"
                  >
                    {label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search providers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 w-full sm:w-56 text-sm"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearch("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] uppercase tracking-wider font-medium w-60">
                  Provider
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                  Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                  Type
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                  Contact
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                  Location
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-medium">
                  Registered
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : providers.length === 0 ? (
                <EmptyState query={search} onClear={() => {}} />
              ) : (
                providers.map((provider) => {
                  const rowLoading = loadingAction?.startsWith(provider.id);
                  const actions = getAvailableActions(provider);
                  const nonViewActions = actions.filter((a) => a !== "view");

                  return (
                    <TableRow
                      key={provider.id}
                      className={
                        rowLoading ? "opacity-50 pointer-events-none" : ""
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <ProviderAvatar
                            name={provider.name}
                            logo={provider.logo}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium truncate max-w-32">
                                {provider.name}
                              </span>
                              {provider.isVerified && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <BadgeCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent>Verified</TooltipContent>
                                </Tooltip>
                              )}
                              {rowLoading && (
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono truncate">
                              /{provider.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={provider.status} />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                          {SERVICE_TYPE_ICON[provider.serviceType]}
                          {provider.serviceType}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60 mt-0.5 capitalize">
                          {BUSINESS_TYPE_ICON[provider.businessType]}
                          {provider.businessType}
                        </div>
                      </TableCell>

                      <TableCell>
                        <p className="text-xs truncate max-w-40">
                          {provider.businessEmail ?? (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </p>
                        {provider.businessPhone && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {provider.businessPhone}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <p className="text-xs text-muted-foreground truncate max-w-30">
                          {provider.address ?? (
                            <span className="opacity-40">—</span>
                          )}
                        </p>
                      </TableCell>

                      <TableCell>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(provider.createdAt)}
                        </p>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              aria-label="Open actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {/* View details always first */}
                            <DropdownMenuItem
                              onSelect={() => handleAction(provider, "view")}
                              className="gap-2 text-xs"
                            >
                              <Info className="h-3.5 w-3.5" />
                              View details
                            </DropdownMenuItem>

                            {nonViewActions.length > 0 && (
                              <DropdownMenuSeparator />
                            )}

                            {nonViewActions.map((action) => {
                              const meta = ACTION_META[action];
                              return (
                                <DropdownMenuItem
                                  key={action}
                                  onSelect={() =>
                                    handleAction(provider, action)
                                  }
                                  className={`gap-2 text-xs ${
                                    meta.menuClassName ?? ""
                                  }`}
                                >
                                  {meta.icon}
                                  {meta.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        state={confirm}
        loading={!!loadingAction}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
    </TooltipProvider>
  );
}
