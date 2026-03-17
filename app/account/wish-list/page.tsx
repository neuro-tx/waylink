"use client";

import { Edit2, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wishlist } from "@/lib/all-types";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistFormValues } from "@/validations";
import { WishlistFormDialog } from "../_components/WishlistFormDialog";
import {
  CardSkeleton,
  EmptyList,
  ItemCard,
  ListDeleteAlert,
  MobileListDropdown,
  NoListSelected,
  SpinningBtn,
  WishlistSidebarCard,
} from "../_components/WishList";
import { useWishlists } from "@/hooks/useWishlist";

export default function WishlistPage() {
  const {
    wishlists,
    wishlistItems,
    activeListId,
    activeList,
    listsState,
    itemsState,
    spinning,
    setActiveListId,
    handleCreate,
    handleUpdate,
    handleRemove,
    refresh,
    handleDeleteItem,
    handleUpdateNote,
  } = useWishlists();

  const [openWishList, setOpenWishList] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [targetList, setTargetList] = useState<Wishlist | null>(null);

  const [openDeleteList, setOpenDeleteList] = useState(false);
  const [selectedList, setSelectedList] = useState<Wishlist | null>(null);
  const [deletingList, setDeletingList] = useState(false);

  const openEditDialog = (list: Wishlist) => {
    setDialogMode("edit");
    setTargetList(list);
    setOpenWishList(true);
  };

  const handleSubmitList = async (values: WishlistFormValues) => {
    if (dialogMode === "create") {
      await handleCreate(values);
      return;
    }
    if (!targetList) return;
    await handleUpdate(targetList.id, values);
  };

  const confirmDeleteList = async () => {
    if (!selectedList) return;
    setDeletingList(true);

    try {
      await handleRemove(selectedList.id);
      setOpenDeleteList(false);
      setSelectedList(null);
    } finally {
      setDeletingList(false);
    }
  };

  const openDeleteDialog = (list: Wishlist) => {
    setSelectedList(list);
    setOpenDeleteList(true);
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-5rem)] overflow-x-hidden w-full">
      <WishlistFormDialog
        open={openWishList}
        onOpenChange={setOpenWishList}
        onSubmit={handleSubmitList}
        mode={dialogMode}
        defaultValues={
          dialogMode === "edit" && targetList
            ? {
                name: targetList.name,
                description: targetList.description ?? "",
                color: targetList.color,
                isPrivate: targetList.isPrivate,
              }
            : undefined
        }
      />

      <ListDeleteAlert
        open={openDeleteList}
        onOpenChange={setOpenDeleteList}
        onConfirm={confirmDeleteList}
        loading={deletingList}
        listName={selectedList?.name}
      />

      <aside className="w-64 h-full relative shrink-0 border-r border-border/50 bg-card/70 flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 flex-nowrap">
            <Button className="flex-1" onClick={() => setOpenWishList(true)}>
              <Plus className="w-3.5 h-3.5" />
              New list
            </Button>
            <SpinningBtn size="icon" spin={spinning} action={refresh} />
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
                isActive={activeListId === wl.id}
                onClick={() => setActiveListId(wl.id)}
              />
            ))}
        </nav>
      </aside>

      <div className="flex-1 h-full flex flex-col min-w-0 overflow-x-hidden bg-card/70">
        <MobileListDropdown
          wishlists={wishlists}
          activeListId={activeListId}
          onSelect={setActiveListId}
          spinnig={spinning}
          openDialog={() => {
            setDialogMode("create");
            setTargetList(null);
            setOpenWishList(true);
          }}
          onEditActive={() => {
            if (activeList) openEditDialog(activeList);
          }}
          onDeleteActive={() => {
            if (activeList) openDeleteDialog(activeList);
          }}
          onRefrsh={refresh}
          state={listsState}
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

              <div className="flex items-center gap-3">
                <Button
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => openDeleteDialog(activeList)}
                >
                  <Trash2 />
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setOpenWishList(true)}
                >
                  <Edit2 />
                </Button>
                {itemsState === "data" && (
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
                )}
              </div>
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
                  <CardSkeleton key={i} />
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
                        onRemove={handleDeleteItem}
                        onEditNote={handleUpdateNote}
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
