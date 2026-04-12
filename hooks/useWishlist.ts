import {
  createList,
  deleteItem,
  removeList,
  updateList,
  updateNote,
} from "@/actions/list.action";
import { Wishlist, WishlistItem } from "@/lib/all-types";
import { asyncHandler } from "@/lib/asyncHandler";
import { WishlistFormValues } from "@/validations";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type LayoutState = "loading" | "error" | "data" | "empty";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const useWishlists = () => {
  const [wishlists, setWishLists] = useState<Wishlist[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [activeListId, setActiveListId] = useState("");
  const [listsState, setListsState] = useState<LayoutState>("loading");
  const [itemsState, setItemsState] = useState<LayoutState>("empty");
  const [spinning, setSpinning] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const activeList = useMemo(() => {
    return wishlists.find((w) => w.id === activeListId) ?? null;
  }, [wishlists, activeListId]);

  const refresh = () => setRefreshKey((prev) => prev + 1);

  const handleCreate = async (values: WishlistFormValues) => {
    const res = await createList(values);
    if (res.state === "error") {
      toast.error(res.message);
      return;
    }

    const newList = res.list as Wishlist;

    setWishLists((prev) => [...prev, newList]);
    setListsState("data");
    toast.success(res.message);
  };

  const handleUpdate = async (id: string, values: WishlistFormValues) => {
    const res = await updateList(id, values);

    if (res.state === "error") {
      toast.error(res.message);
      return;
    }

    const updatedList = res.list as Wishlist;
    setWishLists((prev) =>
      prev.map((list) => (list.id === updatedList.id ? updatedList : list)),
    );

    toast.success(res.message);
  };

  const handleRemove = async (id: string) => {
    const res = await removeList(id);

    if (res.state === "error") {
      toast.error(res.message);
      return;
    }

    setWishLists((prev) => {
      const next = prev.filter((list) => list.id !== id);
      if (activeListId === id) {
        setActiveListId(next[0]?.id ?? "");
      }
      if (next.length === 0) {
        setListsState("empty");
        setWishlistItems([]);
        setItemsState("empty");
      }

      return next;
    });

    toast.success(res.message);
  };

  const getLists = async (): Promise<Wishlist[]> => {
    const res = await fetch(`${baseUrl}/api/user/wish-list`);

    if (!res.ok) {
      throw new Error("Failed to get all lists");
    }

    const data = await res.json();
    return data.data;
  };

  const getItems = async (id: string) => {
    const res = await fetch(`${baseUrl}/api/user/wish-list/${id}`);

    if (!res.ok) {
      throw new Error("Failed to get list items");
    }

    const data = await res.json();
    return data ?? [];
  };

  const fetchItems = async (listId: string) => {
    if (!listId) {
      setWishlistItems([]);
      setItemsState("empty");
      return;
    }

    setItemsState("loading");

    const [data, error] = await asyncHandler(getItems(listId));

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

  const fetchLists = async () => {
    setListsState("loading");
    setSpinning(true);

    const [data, error] = await asyncHandler(getLists());

    if (error) {
      setListsState("error");
      setSpinning(false);
      return;
    }

    if (!data || data.length === 0) {
      setWishLists([]);
      setActiveListId("");
      setListsState("empty");
      setSpinning(false);
      return;
    }

    setWishLists(data);
    setListsState("data");

    setSpinning(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!activeListId) return;
    const res = await deleteItem(activeListId, itemId);

    if (res.state === "error") {
      toast.error(res.message);
      return;
    }
    setWishlistItems((prev) => {
      const next = prev.filter((item) => item.id !== itemId);

      if (next.length === 0) {
        setItemsState("empty");
      }

      return next;
    });
    
    // decrement totalItems for the active wishlist
    setWishLists((prev) =>
      prev.map((list) =>
        list.id === activeListId
          ? { ...list, totalItems: Math.max(0, list.totalItems - 1) }
          : list,
      ),
    );

    toast.success(res.message);
  };

  const handleUpdateNote = async (itemId: string, newNote: string) => {
    if (!activeListId) return;

    const res = await updateNote(itemId, activeListId, newNote);

    if (res.state === "error") {
      toast.error(res.message);
      return;
    }

    setWishlistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, notes: newNote } : item,
      ),
    );

    toast.success(res.message);
  };

  useEffect(() => {
    fetchLists();
  }, [refreshKey]);

  useEffect(() => {
    fetchItems(activeListId);
  }, [activeListId]);

  return {
    // state
    wishlists,
    wishlistItems,
    activeListId,
    activeList,
    listsState,
    itemsState,
    spinning,
    // setters
    setActiveListId,
    // list actions
    handleCreate,
    handleUpdate,
    handleRemove,
    refresh,
    // item actions
    handleDeleteItem,
    handleUpdateNote,
  };
};
