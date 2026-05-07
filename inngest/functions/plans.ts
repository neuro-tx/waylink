import { cron } from "inngest";
import { inngest } from "../client";
import { db } from "@/db";
import { plans, subscriptions } from "@/db/schemas";
import { and, lte, inArray, eq } from "drizzle-orm";
import { renewSubscription } from "@/actions/plans.action";

const expireEndedSubscriptions = inngest.createFunction(
  {
    id: "expire-subscriptions",
    triggers: [cron("0 0,12 * * *")],
  },
  async ({ step }) => {
    await step.run("expire-subscriptions", async () => {
      const now = new Date();

      const subs = await db
        .select({
          id: subscriptions.id,
          autoRenew: subscriptions.autoRenew,
          status: subscriptions.status,
        })
        .from(subscriptions)
        .where(
          and(
            lte(subscriptions.endDate, now),
            inArray(subscriptions.status, ["active", "trialing" ,"cancelled"]),
          ),
        );

      for (const sub of subs) {
        const shouldRenew = sub.status === "active" && sub.autoRenew;

        if (shouldRenew) {
          await renewSubscription(sub.id);
        } else {
          await db
            .update(subscriptions)
            .set({
              status: "expired",
              autoRenew: false,
            })
            .where(eq(subscriptions.id, sub.id));
        }
      }
    });
  },
);

const closeExpiredTrialOffers = inngest.createFunction(
  {
    id: "close-expired-trial-offers",
    triggers: [cron("0 0 * * *")],
  },
  async ({ step }) => {
    await step.run("close-trial-offers", async () => {
      const now = new Date();

      const result = await db
        .update(plans)
        .set({
          trialEnabled: false,
          trialDays: 0,
          trialEndsAt: null,
        })
        .where(and(eq(plans.trialEnabled, true), lte(plans.trialEndsAt, now)))
        .returning({
          id: plans.id,
        });

      return {
        closedOffers: result.length,
        dateTime: now,
      };
    });
  },
);

export const plansFuncs = [expireEndedSubscriptions, closeExpiredTrialOffers];
