import { bookingsFuncs } from "./functions/bookings";
import { notificationFuncs } from "./functions/notifications";
import { plansFuncs } from "./functions/plans";
import { productsFns } from "./functions/products";
import { providerFns } from "./functions/provider";
import { scoreFns } from "./functions/score";

export const functions = [
  ...bookingsFuncs,
  ...plansFuncs,
  ...scoreFns,
  ...productsFns,
  ...providerFns,
  ...notificationFuncs,
];
