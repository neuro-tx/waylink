"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  AlertCircle,
  Circle,
  Info,
  Loader2,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Notification } from "@/db/schemas";
import { NotificationType } from "@/lib/all-types";
import { TYPE_META } from "./NotificationsCenterClient";
import { useForm } from "react-hook-form";
import { sendNotificationSchema, SendNotificationValues } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RecipientType } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { fmtDateTime } from "@/lib/helpers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { broadcastAnnouncement } from "@/actions/notification.action";

type FilterKey = "type" | "recipient" | "read";

const RECIPIENT_META: Record<
  RecipientType,
  { label: string; color: string; dot: string }
> = {
  user: {
    label: "User",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dot: "bg-sky-500",
  },
  provider: {
    label: "Provider",
    color:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    dot: "bg-violet-500",
  },
  admin: {
    label: "Admin",
    color:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
};

export function SendNotificationDialog({
  open,
  onClose,
  recipientId,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  recipientId: string | null;
  onComplete?: (item?: Notification) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      title: "",
      type: "general",
      recipientType: null,
      message: "",
      broadcastAll: false,
    },
  });

  const broadcastAll = form.watch("broadcastAll");

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  useEffect(() => {
    if (broadcastAll) {
      form.setValue("recipientType", null, {
        shouldValidate: true,
      });
    }
  }, [broadcastAll, form]);

  const handleSubmit = (values: SendNotificationValues) => {
    startTransition(async () => {
      try {
        const res = await broadcastAnnouncement(
          values,
          recipientId ?? undefined,
        );

        if (!res.success) {
          setError(res?.error || "Failed to send notification");
          return;
        }

        onComplete?.(res?.data as Notification);
        form.reset();
        onClose();
      } catch (error) {}
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            Send Notification
          </DialogTitle>
          <DialogDescription>
            {recipientId ? (
              <span>
                Send a notification directly to{" "}
                <span className="text-fuchsia-500 inline text-xs">
                  ${recipientId}
                </span>
                .
              </span>
            ) : (
              "Create and send a notification to a selected audience or broadcast it to all recipients."
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-1"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Scheduled downtime tonight"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {(Object.keys(TYPE_META) as NotificationType[]).map(
                          (t) => {
                            const meta = TYPE_META[t];
                            const Icon = meta.icon;

                            return (
                              <SelectItem key={t} value={t}>
                                <div className="flex items-center gap-2">
                                  <Icon className="size-3.5 text-muted-foreground" />
                                  {meta.label}
                                </div>
                              </SelectItem>
                            );
                          },
                        )}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>

                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={broadcastAll}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              broadcastAll
                                ? "Broadcasting to everyone"
                                : "Select recipient"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="user">Users</SelectItem>
                        <SelectItem value="provider">Providers</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="broadcastAll"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <div className="space-y-1 text-muted-foreground">
                    <FormLabel className="font-normal">
                      Broadcast notification to all recipients
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>

                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Write the notification body..."
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-destructive">
                    Failed to send notification
                  </p>

                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>

              <Button type="submit" className="gap-2" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete notification</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. The selected notification will be
          permanently removed.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TypeBadge({ type }: { type: NotificationType }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium font-mono",
        meta.color,
      )}
    >
      <Icon className="size-3" />
      {meta.label}
    </span>
  );
}

export function RecipientBadge({ type }: { type: RecipientType }) {
  const meta = RECIPIENT_META[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium font-mono",
        meta.color,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function NotificationDetail({
  notification,
  onClose,
  onDelete,
}: {
  notification: Notification | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!notification) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Notification Detail
          </p>
          <h3 className="font-semibold">{notification.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-1">
          <TypeBadge type={notification.type} />
          <RecipientBadge type={notification.recipientType} />
          {!notification.isRead && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary font-mono">
              <Circle className="size-2 fill-current" />
              Unread
            </span>
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-sm text-foreground leading-relaxed">
            {notification.message}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient ID</span>
            <span className="font-mono text-xs">
              {notification.recipientId}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sent</span>
            <span>{notification.createdAt.toLocaleString()}</span>
          </div>
          {notification.readAt && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Read at</span>
                <span>{fmtDateTime(notification.readAt)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t p-4">
        {/* {!notification.isRead && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onMarkRead(notification.id)}
          >
            <CheckCheck className="size-4" />
            Mark as read
          </Button>
        )} */}
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={() => {
            onDelete(notification.id);
            onClose();
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => ({
      type: (searchParams.get("type") ?? "all") as NotificationType | "all",
      recipient: (searchParams.get("recipient") ?? "all") as
        | RecipientType
        | "all",
      read: (searchParams.get("read") ?? "all") as "all" | "read" | "unread",
    }),
    [searchParams],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const activeCount = useMemo(
    () =>
      [
        filters.type !== "all",
        filters.recipient !== "all",
        filters.read !== "all",
      ].filter(Boolean).length,
    [filters],
  );

  return { filters, setFilter, clearFilters, activeCount };
}

export const NotificationRow = memo(function NotificationRow({
  notification: n,
  isActive,
  onRowClick,
  onSend,
  onDelete,
  isActionPending,
}: {
  notification: Notification;
  isActive: boolean;
  onRowClick: (n: Notification) => void;
  onSend: (recipientId: string) => void;
  onDelete: (id: string) => void;
  isActionPending: boolean;
}) {
  return (
    <TableRow
      className={cn(
        "xl:cursor-pointer transition-colors",
        !n.isRead &&
          "bg-amber-500/3 dark:bg-amber-500/10 dark:hover:bg-amber-500/15! hover:bg-amber-500/7!",
        isActive && "bg-accent",
      )}
      onClick={() => onRowClick(n)}
    >
      <TableCell className="max-w-0 px-3">
        <p className={cn("truncate text-sm", !n.isRead && "font-semibold")}>
          {n.title}
        </p>
        <p className="hidden truncate text-xs text-muted-foreground lg:block">
          {n.message}
        </p>
      </TableCell>

      <TableCell>
        <TypeBadge type={n.type} />
      </TableCell>

      <TableCell>
        <RecipientBadge type={n.recipientType} />
      </TableCell>

      <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
        {fmtDateTime(n.createdAt)}
      </TableCell>

      <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
        {n.readAt ? (
          fmtDateTime(n.readAt)
        ) : (
          <span className="text-amber-500 rounded-md border px-2 py-0.5 text-xs font-medium font-mono border-amber-500/20">
            Unread
          </span>
        )}
      </TableCell>

      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" size="icon-sm" className="cursor-pointer">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onSend(n.recipientId)}>
                <Send className="size-4 text-sky-500" />
                Send Notification
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRowClick(n)}>
                <Info className="size-4 text-amber-500" />
                View detail
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {!n.isRead && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={isActionPending}
                  className="text-destructive focus:text-destructive bg-destructive/5 focus:bg-destructive/10 dark:bg-destructive/10 dark:focus:bg-destructive/20"
                  onClick={() => onDelete(n.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});
