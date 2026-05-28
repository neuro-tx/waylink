import { bookingsFuncs } from "./functions/bookings";
import { plansFuncs } from "./functions/plans";
import { scoreFns } from "./functions/score";

export const functions = [...bookingsFuncs, ...plansFuncs, ...scoreFns];
