import { db } from "@/db";
import { inngest } from "../client";
import { notifications, providers, user } from "@/db/schemas";
import { eq } from "drizzle-orm";

export const sendNotificationBroadcast = inngest.createFunction(
  {
    id: "send-broadcast",
    triggers: { event: "app/notification.send" },
  },
  async ({ event, step }) => {
    const { broadcastAll, message, recipientType, title, type } = event.data;

    // Broadcast
    const recipients = await step.run("load-recipients", async () => {
      const usersPromise =
        !recipientType || recipientType === "user"
          ? db.select({ id: user.id }).from(user)
          : Promise.resolve([]);

      const providersPromise =
        !recipientType || recipientType === "provider"
          ? db.select({ id: providers.id }).from(providers)
          : Promise.resolve([]);

      const adminsPromise =
        recipientType === "admin"
          ? db.select({ id: user.id }).from(user).where(eq(user.role, "admin"))
          : Promise.resolve([]);

      const [users, providersList, admins] = await Promise.all([
        usersPromise,
        providersPromise,
        adminsPromise,
      ]);

      return {
        users,
        providers: providersList,
        admins,
      };
    });

    const values = [
      ...recipients.users.map((u) => ({
        recipientId: u?.id as string,
        recipientType: "user" as any,
        title,
        message,
        type,
      })),

      ...recipients.providers.map((p) => ({
        recipientId: p?.id as string,
        recipientType: "provider" as any,
        title,
        message,
        type,
      })),

      ...recipients.admins.map((a) => ({
        recipientId: a?.id as string,
        recipientType: "admin" as any,
        title,
        message,
        type,
      })),
    ];

    await step.run("create-notifications", async () => {
      if (values.length === 0) return;
      await db.insert(notifications).values(values);
    });

    return {
      success: true,
      sent: values.length,
    };
  },
);

export const notificationFuncs = [sendNotificationBroadcast];
