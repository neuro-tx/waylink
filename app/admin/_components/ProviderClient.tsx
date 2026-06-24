"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, AlertCircle, X } from "lucide-react";
import {
  Pagination,
  Provider,
  ProviderStatus,
  ServiceType,
} from "@/lib/all-types";
import { useRouter } from "next/navigation";
import {
  ACTION_META,
  ActionType,
  ConfirmDialog,
  EmptyState,
  ProviderTableRow,
  SERVICE_TYPE_ICON,
  ProviderPagination,
  TableRowSkeleton,
  ConfirmState,
} from "./ProviderLayout";
import { providerUrl } from "@/lib/url-builder";
import { useDebounce } from "@/hooks/useDebounce";
import {
  changeProviderStatus,
  deleteProvider,
} from "@/actions/provider.action";

const STATUS_TABS: { key: ProviderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "inactive", label: "Inactive" },
  { key: "suspended", label: "Suspended" },
  { key: "rejected", label: "Rejected" },
];

export default function ProviderClient() {
  const [activeTab, setActiveTab] = useState<ProviderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "all">(
    "all",
  );
  const [providers, setProviders] = useState<Provider[]>([]);
  const [state, setState] = useState<"loading" | "data" | "empty" | "error">(
    "loading",
  );

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    provider: null,
    action: null,
  });
  const router = useRouter();
  const debouncedSearch = useDebounce(search);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: 0,
    offset: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, serviceFilter]);

  const buildQuery = (p: number) => {
    return providerUrl(
      {
        search: debouncedSearch,
        business: "all",
        service: serviceFilter,
        status: activeTab,
        page: p,
        limit: 1,
      },
      "admin",
    );
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProviders = async () => {
      setState("loading");
      try {
        const res = await fetch(buildQuery(currentPage), {
          signal: controller.signal,
        });
        if (!res.ok) {
          setState("error");
          return;
        }
        const json = await res.json();
        const payload = json.data ?? json;
        const items = payload.data ?? [];

        if (items.length === 0) {
          setState("empty");
          return;
        }
        setProviders(items);
        setPagination(payload.pagination);
        setState("data");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setState("error");
        }
      }
    };

    fetchProviders();
    return () => controller.abort();
  }, [debouncedSearch, activeTab, serviceFilter, currentPage]);

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
      const res =
        action === "del"
          ? await deleteProvider(provider.id)
          : await changeProviderStatus(provider.id, action);

      const updatedProvider = res.provider as Provider;
      setProviders((prev) =>
        action === "del"
          ? prev.filter((p) => p.id !== updatedProvider.id)
          : prev.map((p) =>
              p.id === updatedProvider.id ? updatedProvider : p,
            ),
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
      <div className="w-full px-4 md:px-6 py-6 space-y-5">
        <div className="flex items-start flex-col sm:flex-row justify-between gap-4">
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
                disabled={state === "loading"}
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap transition">
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
                    className="text-sm h-7 gap-1.5 data-[state=active]:bg-background"
                    disabled={state === "loading"}
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
              className="pl-9 h-9 w-full sm:w-56 text-sm"
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

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-sm px-3 font-medium w-60">
                  Provider
                </TableHead>
                <TableHead className="text-sm font-medium">Status</TableHead>
                <TableHead className="text-sm font-medium">
                  Service Type
                </TableHead>
                <TableHead className="text-sm font-medium">
                  Business Type
                </TableHead>
                <TableHead className="text-sm font-medium">Contact</TableHead>
                <TableHead className="text-sm font-medium">Location</TableHead>
                <TableHead className="text-sm font-medium">
                  Registered
                </TableHead>
                <TableHead className="text-sm font-medium">
                  Last Updated
                </TableHead>
                <TableHead className="w-10 px-3" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {state === "loading" ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : state === "empty" ? (
                <EmptyState query={search} onClear={() => {}} />
              ) : (
                providers.map((provider) => (
                  <ProviderTableRow
                    key={provider.id}
                    provider={provider}
                    isLoading={loadingAction?.startsWith(provider.id)}
                    onAction={handleAction}
                  />
                ))
              )}
            </TableBody>
          </Table>

          <ProviderPagination
            pagination={pagination}
            isLoading={state === "loading"}
            onPageChange={setCurrentPage}
          />
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
