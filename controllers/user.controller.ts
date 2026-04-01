import { auth } from "@/lib/auth";
import { getAuthSession } from "@/lib/auth-server";
import { Errors } from "@/lib/errors";
import { userService } from "@/services/user.service";

const userWishList = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    throw Errors.unauthorized(
      "User must be authenticated to access wishlists.",
    );
  }
  return await userService.getUserWishlists(session.user.id);
};

const listItems = async (listId: string) => {
  const session = await getAuthSession();
  if (!session?.user) {
    throw Errors.unauthorized(
      "User must be authenticated to access wishlists.",
    );
  }
  return await userService.getListItems(listId);
};

const userProvider = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    throw Errors.unauthorized(
      "User must be authenticated to access wishlists.",
    );
  }

  return await userService.getUserProvider(session.user.id);
};

export const userController = { userWishList, listItems, userProvider };
