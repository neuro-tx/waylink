import { auth } from "@/lib/auth";
import { Errors } from "@/lib/errors";
import { userService } from "@/services/user.service";
import { headers } from "next/headers";

const getAuthSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw Errors.unauthorized();
  }

  return session;
};

const userWishList = async () => {
  const { user } = await getAuthSession();
  return await userService.getUserWishlists(user.id);
};

const listItems = async (listId: string) => {
  await getAuthSession();
  return await userService.getListItems(listId);
};

export const userController = { userWishList, listItems };
