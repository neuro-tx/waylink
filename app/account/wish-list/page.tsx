"use client";

import { cn } from "@/lib/utils";
import {
  X,
  Lock,
  Plus,
  Heart,
  MapPin,
  Star,
  StickyNote,
  ChevronRight,
  RefreshCcw,
  LockOpen,
  ChevronDown,
} from "lucide-react";
import {
  useState,
  KeyboardEvent,
  useEffect,
  ComponentProps,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ServiceType, Wishlist, WishlistItem } from "@/lib/all-types";
import { displayMedia, normalizeLocation } from "@/lib/helpers";
import { asyncHandler } from "@/lib/handler";
import { Skeleton } from "@/components/ui/skeleton";

type LayoutState = "loading" | "error" | "data" | "empty";
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

function SpinningBtn({
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

function MobileListDropdown({
  wishlists,
  wishlistItems,
  activeListId,
  onSelect,
  spinnig,
  onRefrsh,
}: {
  wishlists: Wishlist[];
  wishlistItems: WishlistItem[];
  activeListId: string | null;
  onSelect: (id: string) => void;
  spinnig: boolean;
  onRefrsh?: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const active = wishlists.find((w) => w.id === activeListId);

  return (
    <div className="md:hidden shrink-0 border-b border-border">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 min-w-0 cursor-pointer"
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

        <Button className="shrink-0" size="sm">
          <Plus size={16} /> New List
        </Button>
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
              {wishlists.map((wl) => (
                <WishlistSidebarCard
                  key={wl.id}
                  wl={wl}
                  itemCount={
                    wishlistItems.filter((i) => i.wishlistId === wl.id).length
                  }
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

function WishlistSidebarCard({
  wl,
  itemCount,
  isActive,
  onClick,
}: {
  wl: Wishlist;
  itemCount: number;
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
            {itemCount} item{itemCount !== 1 ? "s" : ""}
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

function ItemCard({
  item,
  onRemove,
  onEditNote,
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onEditNote: (id: string, note: string) => void;
}) {
  const tc = TYPE_CONFIG[item.itemType];
  const [editingNote, setEditingNote] = useState(false);
  const [noteVal, setNoteVal] = useState(item.notes ?? "");

  const saveNote = () => {
    onEditNote(item.id, noteVal);
    setEditingNote(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveNote();
    if (e.key === "Escape") setEditingNote(false);
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

function NoListSelected() {
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

function EmptyList({ color }: { color: string }) {
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

export default function WishlistPage() {
  const [wishlists, setWishLists] = useState<Wishlist[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [activeListId, setActiveListId] = useState<string>("");
  const [listsState, setListsState] = useState<LayoutState>("loading");
  const [itemsState, setItemsState] = useState<LayoutState>("loading");
  const [spinning, setSpinning] = useState(false);
  const [refrshKey, setRefrshKey] = useState(0);

  const activeList = useMemo(() => {
    return wishlists.find((w) => w.id === activeListId) ?? null;
  }, [wishlists, activeListId]);

  const removeItem = (id: string) =>
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));

  const editNote = (id: string, note: string) =>
    setWishlistItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, notes: note || null } : i)),
    );

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const getLists = async (): Promise<Wishlist[]> => {
    const res = await fetch(`${baseUrl}/api/user/wish-list`);

    if (!res.ok) {
      throw new Error("failed to get all lists");
    }

    const data = await res.json();
    return data.data;
  };
  const getItem = async (id: string) => {
    const res = await fetch(`${baseUrl}/api/user/wish-list/${id}`);
    if (!res.ok) {
      throw new Error("failed to get all lists");
    }

    const data = await res.json();
    return data ?? [];
  };

  useEffect(() => {
    const main = async () => {
      setListsState("loading");
      setSpinning(true);

      const [data, error] = await asyncHandler(getLists());
      if (error) {
        setListsState("error");
        setSpinning(false);
        return;
      }
      if (data.length === 0) {
        setListsState("empty");
        setSpinning(false);
        return;
      }

      setWishLists(data ?? []);
      setListsState("data");
      setSpinning(false);
    };

    main();
  }, [refrshKey]);

  useEffect(() => {
    const loadItems = async () => {
      if (!activeListId) {
        setWishlistItems([]);
        setItemsState("empty");
        return;
      }

      setItemsState("loading");

      const [data, error] = await asyncHandler(getItem(activeListId));
      if (error || !data) {
        setWishlistItems([]);
        setItemsState("error");
        return;
      }

      const items = data.data.items ?? [];
      setWishlistItems(items);
      if (items.length === 0) {
        setItemsState("empty");
        return;
      }

      setItemsState("data");
    };

    loadItems();
  }, [activeListId]);

  return (
    <div className="flex h-full min-h-[calc(100vh-5rem)] overflow-x-hidden w-full">
      <aside className="w-64 h-full relative shrink-0 border-r border-border/50 bg-card/70 flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 flex-nowrap">
            <Button className="flex-1">
              <Plus className="w-3.5 h-3.5" />
              New list
            </Button>
            <SpinningBtn
              size="icon"
              spin={spinning}
              action={() => setRefrshKey((i) => i + 1)}
            />
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
          {listsState === "loading" && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          )}

          {listsState === "empty" && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/50 hover:border-solid px-4 py-8 text-center">
              <div className="mb-2 rounded-full border border-border/60 aspect-square bg-background/80 p-3">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>

              <h3 className="text-sm font-semibold text-foreground text">
                No lists yet
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first wishlist to start saving experiences and
                transport.
              </p>
            </div>
          )}

          {listsState === "error" && (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
              <div className="mb-2 rounded-full border border-destructive/20 aspect-square bg-background/80 p-3">
                <RefreshCcw className="h-4 w-4 text-destructive" />
              </div>

              <h3 className="text-sm font-semibold text-destructive">
                Failed to load lists
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Something went wrong while fetching your wishlists.
              </p>
            </div>
          )}

          {listsState === "data" &&
            wishlists.map((wl) => (
              <WishlistSidebarCard
                key={wl.id}
                wl={wl}
                itemCount={
                  wishlistItems.filter((i) => i.wishlistId === wl.id).length
                }
                isActive={activeListId === wl.id}
                onClick={() => setActiveListId(wl.id)}
              />
            ))}
        </nav>
      </aside>

      <div className="flex-1 h-full flex flex-col min-w-0 overflow-x-hidden bg-card/70">
        <MobileListDropdown
          wishlists={wishlists}
          wishlistItems={wishlistItems}
          activeListId={activeListId}
          onSelect={setActiveListId}
          spinnig={spinning}
          onRefrsh={() => setRefrshKey((i) => i + 1)}
        />

        <AnimatePresence mode="wait">
          {activeList ? (
            <motion.div
              key={activeList.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="px-4 md:px-6 py-3.5 border-b hidden md:flex items-center justify-between gap-4 shrink-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{
                    background: activeList.color,
                    boxShadow: `0 0 12px ${activeList.color}60`,
                  }}
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-foreground truncate">
                    {activeList.name}
                  </h2>
                  <p className="text-muted-foreground text-xs max-w-md truncate">
                    {activeList.description}
                  </p>
                </div>
              </div>
              <span
                className="text-xs rounded-full px-3 py-1 border font-medium shrink-0"
                style={{
                  color: activeList.color,
                  borderColor: `${activeList.color}40`,
                  background: `${activeList.color}10`,
                }}
              >
                {wishlistItems.length} item
                {wishlistItems.length !== 1 ? "s" : ""}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="no-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-4 border-b shrink-0"
            >
              <h2 className="text-sm font-bold text-foreground">Wishlist</h2>
              <p className="text-xs text-muted-foreground">
                Your saved items across all lists
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 p-5">
          <AnimatePresence mode="wait">
            {!activeList ? (
              <motion.div
                key="no-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <NoListSelected />
              </motion.div>
            ) : itemsState === "loading" ? (
              <motion.div
                key="loading-items"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-3xl" />
                ))}
              </motion.div>
            ) : itemsState === "error" ? (
              <motion.div
                key="items-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-destructive/20 bg-destructive/5 px-6 text-center">
                  <div className="mb-3 rounded-full border border-destructive/20 bg-background/80 p-3">
                    <RefreshCcw className="h-5 w-5 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-destructive">
                    Failed to load items
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Something went wrong while loading this wishlist.
                  </p>
                </div>
              </motion.div>
            ) : itemsState === "empty" ? (
              <motion.div
                key="empty-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <EmptyList color={activeList.color} />
              </motion.div>
            ) : (
              <motion.div
                key={activeList.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence>
                  {wishlistItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    >
                      <ItemCard
                        item={item}
                        onRemove={removeItem}
                        onEditNote={editNote}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
