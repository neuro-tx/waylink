import { bookingsFuncs } from "./functions/bookings";
import { plansFuncs } from "./functions/plans";

export const functions = [...bookingsFuncs, ...plansFuncs];
