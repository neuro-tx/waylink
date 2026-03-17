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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceType, Wishlist, WishlistItem } from "@/lib/all-types";
import { displayMedia, normalizeLocation } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Heart,
  Lock,
  LockOpen,
  MapPin,
  Plus,
  RefreshCcw,
  Star,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import { ComponentProps, KeyboardEvent, useEffect, useState } from "react";

const TYPE_CONFIG: Record<ServiceType, { label: string; color: string }> = {
  experience: {
    label: "experience",
    color: "#e8734a",
  },
  transport: {
    label: "transport",
    color: "#5b8cf5",
  },
};

type ListDeleteAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  listName?: string;
};

interface MobileListDropdownProps {
  wishlists: Wishlist[];
  activeListId: string | null;
  onSelect: (id: string) => void;
  spinnig: boolean;
  openDialog: () => void;
  onEditActive?: () => void;
  onDeleteActive?: () => void;
  onRefrsh?: () => void | Promise<void>;
  state?: "loading" | "error" | "empty" | "data";
}

export function SpinningBtn({
  spin,
  size,
  action,
}: {
  spin: boolean;
  size: ComponentProps<typeof Button>["size"];
  action?: () => void | Promise<void>;
}) {
  return (
    <Button size={size} variant="outline" disabled={spin} onClick={action}>
      <motion.div
        className="relative z-10"
        animate={spin ? { rotate: 360 } : { rotate: 0 }}
        transition={
          spin
            ? { duration: 0.65, repeat: Infinity, ease: "linear" }
            : { duration: 0.32, ease: "easeOut" }
        }
      >
        <RefreshCcw size={16} />
      </motion.div>
    </Button>
  );
}

export function MobileListDropdown({
  wishlists,
  activeListId,
  onSelect,
  spinnig,
  openDialog,
  onEditActive,
  onDeleteActive,
  onRefrsh,
  state = "data",
}: MobileListDropdownProps) {
  const [open, setOpen] = useState(false);
  const active = wishlists.find((w) => w.id === activeListId);

  return (
    <div className="md:hidden shrink-0 border-b border-border">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 min-w-0 cursor-pointer"
        >
          {active ? (
            <>
              <div
                className="w-2.25 h-2.25 rounded-full shrink-0"
                style={{ background: active.color }}
              />
              <span className="text-sm font-semibold text-foreground truncate">
                {active.name}
              </span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.span>
            </>
          ) : state === "loading" ? (
            <span className="text-sm text-muted-foreground animate-pulse">
              Loading…
            </span>
          ) : state === "error" ? (
            <span className="text-sm text-destructive">Failed to load</span>
          ) : state === "empty" ? (
            <span className="text-sm text-muted-foreground">No lists</span>
          ) : (
            <>
              <Heart className="w-4 h-4 text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-muted-foreground">
                Select a list…
              </span>
            </>
          )}
        </button>

        <div className="flex-1" />

        {onRefrsh && (
          <Button
            size="icon-sm"
            variant="outline"
            disabled={spinnig}
            onClick={onRefrsh}
          >
            <motion.div
              className="relative z-10"
              animate={spinnig ? { rotate: 360 } : { rotate: 0 }}
              transition={
                spinnig
                  ? { duration: 0.65, repeat: Infinity, ease: "linear" }
                  : { duration: 0.32, ease: "easeOut" }
              }
            >
              <RefreshCcw size={16} />
            </motion.div>
          </Button>
        )}

        <Button className="shrink-0" size="sm" onClick={openDialog}>
          <Plus size={16} /> New List
        </Button>

        {active && onEditActive && (
          <Button size="icon-sm" variant="outline" onClick={onEditActive}>
            <Edit2 size={16} />
          </Button>
        )}

        {active && onDeleteActive && (
          <Button size="icon-sm" variant="destructive" onClick={onDeleteActive}>
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border/40"
          >
            <div className="p-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto">
              {state === "loading" &&
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}

              {state === "error" && (
                <div className="text-xs text-destructive text-center py-2">
                  Failed to load wishlists
                </div>
              )}

              {state === "empty" && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No wishlists available
                </div>
              )}

              {state === "data" &&
                wishlists?.map((wl) => (
                  <WishlistSidebarCard
                    key={wl.id}
                    wl={wl}
                    isActive={activeListId === wl.id}
                    onClick={() => {
                      onSelect(wl.id);
                      setOpen(false);
                    }}
                  />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WishlistSidebarCard({
  wl,
  isActive,
  onClick,
}: {
  wl: Wishlist;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 group relative overflow-hidden",
        isActive
          ? "border-transparent text-foreground"
          : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70 hover:bg-accent/30",
      )}
      style={
        isActive
          ? { background: `${wl.color}18`, borderColor: `${wl.color}50` }
          : {}
      }
    >
      <div
        className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{
          background: wl.color,
          boxShadow: isActive ? `0 0 8px ${wl.color}80` : "none",
        }}
      />

      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-xs font-semibold truncate",
            isActive && "text-foreground",
          )}
        >
          {wl.name}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {wl.totalItems} item{wl.totalItems !== 1 ? "s" : ""}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium border mt-0.5",
              wl.isPrivate
                ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                : "bg-blue-500/10 text-blue-400 border-blue-500/30",
            )}
          >
            {wl.isPrivate ? (
              <>
                <Lock className="w-2.5 h-2.5" /> Private
              </>
            ) : (
              <>
                <LockOpen className="w-2.5 h-2.5" /> Public
              </>
            )}
          </span>
        </div>
      </div>

      {isActive && (
        <ChevronRight
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: wl.color }}
        />
      )}
    </button>
  );
}

export function ItemCard({
  item,
  onRemove,
  onEditNote,
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onEditNote: (id: string, note: string) => void | Promise<void>;
}) {
  const tc = TYPE_CONFIG[item.itemType];
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal, setNoteVal] = useState(item.notes ?? "");

  useEffect(() => {
    if (!editingNote) {
      setNoteVal(item.notes ?? "");
    }
  }, [item.notes, editingNote]);

  const saveNote = async () => {
    const trimmed = noteVal.trim();

    if (trimmed === (item.notes ?? "")) {
      setEditingNote(false);
      return;
    }

    await onEditNote(item.id, trimmed);
    setEditingNote(false);
  };

  const cancelEdit = () => {
    setNoteVal(item.notes ?? "");
    setEditingNote(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveNote();
    if (e.key === "Escape") cancelEdit();
  };

  const { cover } = displayMedia(item.media);
  const { to } = normalizeLocation(item.locations);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative rounded-xl border border-border overflow-hidden bg-card backdrop-blur-sm transition-all duration-300 drop-shadow-xl flex flex-col"
    >
      <div className="relative h-40 overflow-hidden bg-accent/20 shrink-0">
        {cover ? (
          <img
            src={cover}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground/20" />
          </div>
        )}

        <div
          className="absolute inset-0 transition duration-300"
          style={{
            background: "linear-gradient(135deg, #FF6B3522, #FF6B3508)",
          }}
        />

        <span
          className="absolute top-2.5 bg-black left-2.5 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg backdrop-blur-lg border"
          style={{
            color: tc.color,
            borderColor: `${tc.color}30`,
          }}
        >
          {tc.label}
        </span>

        <button
          onClick={() => onRemove(item.id)}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <X size={13} className="text-white" />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="text-xs truncate">
              {to?.city && to?.country ? (
                <span>
                  {to.city}, {to.country}
                </span>
              ) : (
                <span className="underline underline-offset-2">
                  Not Detected
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-foreground">
              {item.avgRate}
            </span>
            <span className="text-xs text-muted-foreground">
              ({item.reviews})
            </span>
          </div>
          <span className="text-sm font-bold text-foreground">
            ${item.basePrice}
            <span className="text-xs font-normal text-muted-foreground">
              /person
            </span>
          </span>
        </div>

        <div className="mt-1">
          {editingNote ? (
            <div className="flex gap-1.5">
              <input
                autoFocus
                value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a note…"
                className="flex-1 text-xs rounded-lg px-2.5 py-1.5 border border-border bg-accent/40 text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-border/80 transition"
              />
              <button
                onClick={saveNote}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/25 transition cursor-pointer"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingNote(true)}
              className={cn(
                "w-full flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-150 text-left cursor-pointer",
                item.notes
                  ? "border-border/50 text-muted-foreground hover:border-border hover:bg-accent/30"
                  : "border-dashed border-border/40 text-muted-foreground/50 hover:border-border/60 hover:text-muted-foreground",
              )}
            >
              <StickyNote className="w-3 h-3 shrink-0" />
              <span className={cn("truncate", item.notes && "italic")}>
                {item.notes ?? "Add a note…"}
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function NoListSelected() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full min-h-90 text-center px-6"
    >
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-3xl bg-accent/50 border flex items-center justify-center">
          <Heart className="w-8 h-8 text-red-500" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-foreground">
        Select a wishlist
      </h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
        Pick a list from the sidebar to view and manage your saved items
      </p>
    </motion.div>
  );
}

export function EmptyList({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full min-h-80 text-center px-6"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border"
        style={{ background: `${color}10`, borderColor: `${color}30` }}
      >
        <Heart className="w-7 h-7" style={{ color: `${color}60` }} />
      </div>
      <h3 className="font-bold text-foreground">This list is empty</h3>
      <p className="text-xs text-muted-foreground mt-1.5">
        Browse experiences and save them here
      </p>
    </motion.div>
  );
}

export function CardSkeleton() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group relative rounded-xl border border-border overflow-hidden bg-card backdrop-blur-sm transition-all duration-300 drop-shadow-xl flex flex-col"
    >
      <div className="relative h-40 overflow-hidden bg-accent/20 shrink-0 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <Skeleton className="h-4 w-3/4 mb-1" />
          <div className="flex items-center gap-1 mt-1">
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="mt-1">
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

export function ListDeleteAlert({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  listName,
}: ListDeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {listName ? `"${listName}"` : "this wishlist"}?
          </AlertDialogTitle>

          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the list
            and all items inside it.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            // className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
