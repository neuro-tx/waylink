"use server";

import { db } from "@/db";
import { wishlistItems, wishlists } from "@/db/schemas";
import { getAuthSession } from "@/lib/auth-server";
import { wishlistFormSchema, WishlistFormValues } from "@/validations";
import { eq, and } from "drizzle-orm";

export const createList = async (dataForm: WishlistFormValues) => {
  const session = await getAuthSession();
  if (!session) {
    return { message: "Unauthorized", state: "error" };
  }

  const result = wishlistFormSchema.safeParse(dataForm);

  if (!result.success) {
    return {
      message: result.error.issues[0]?.message || "Invalid form data",
      state: "error",
    };
  }

  const { color, isPrivate, name, description } = result.data;
  const [newList] = await db
    .insert(wishlists)
    .values({
      userId: session.user.id,
      color,
      description,
      isPrivate,
      name,
    })
    .returning();

  return {
    message: "List created successfully",
    state: "success",
    list: newList,
  };
};

export const removeList = async (listId: string) => {
  const session = await getAuthSession();
  if (!session) {
    return { message: "Unauthorized", state: "error" };
  }

  const deleted = await db
    .delete(wishlists)
    .where(and(eq(wishlists.id, listId), eq(wishlists.userId, session.user.id)))
    .returning();

  if (deleted.length === 0)
    return { state: "error", message: "Not found or no permission" };

  return {
    message: "List removed successfully",
    state: "success",
  };
};

export const updateList = async (id: string, data: WishlistFormValues) => {
  const session = await getAuthSession();
  if (!session) return { state: "error", message: "Unauthorized" };

  const result = wishlistFormSchema.safeParse(data);
  if (!result.success)
    return { state: "error", message: result.error.issues[0]?.message };

  const { color, name, description, isPrivate } = result.data;
  const updated = await db
    .update(wishlists)
    .set({ color, name, description, isPrivate })
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
    .returning();

  if (updated.length === 0)
    return { state: "error", message: "Not found or no permission" };

  return {
    state: "success",
    message: "Updated successfully",
    list: updated[0],
  };
};

export const deleteItem = async (listId: string, id: string) => {
  const session = await getAuthSession();
  if (!session) {
    return { state: "error", message: "Unauthorized" };
  }
  const ownerList = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.id, listId), eq(wishlists.userId, session.user.id)),
    columns: {
      id: true,
    },
  });

  if (!ownerList) {
    return {
      state: "error",
      message: "List not found or you do not have permission",
    };
  }
  const deleted = await db
    .delete(wishlistItems)
    .where(and(eq(wishlistItems.id, id), eq(wishlistItems.wishlistId, listId)))
    .returning();

  if (deleted.length === 0) {
    return {
      state: "error",
      message: "Item not found",
    };
  }

  return {
    state: "success",
    message: "Item deleted successfully",
    item: deleted[0],
  };
};

export const updateNote = async (
  id: string,
  listId: string,
  newNote: string,
) => {
  const session = await getAuthSession();
  if (!session) {
    return { state: "error", message: "Unauthorized" };
  }

  const safeNote = newNote.trim();
  if (safeNote.length > 200) {
    return {
      state: "error",
      message: "Note must be 200 characters or less",
    };
  }
  const ownerList = await db.query.wishlists.findFirst({
    where: and(eq(wishlists.id, listId), eq(wishlists.userId, session.user.id)),
    columns: {
      id: true,
    },
  });
  if (!ownerList) {
    return {
      state: "error",
      message: "List not found or you do not have permission",
    };
  }

  const updated = await db
    .update(wishlistItems)
    .set({ notes: safeNote })
    .where(and(eq(wishlistItems.id, id), eq(wishlistItems.wishlistId, listId)))
    .returning();

  if (updated.length === 0) {
    return {
      state: "error",
      message: "Item not found",
    };
  }

  return {
    state: "success",
    message: "Item updated successfully",
    item: updated[0],
  };
};
