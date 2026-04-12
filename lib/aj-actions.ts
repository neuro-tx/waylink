import { request } from "@arcjet/next";
import { aj } from "./arcjet";
import { Role } from "./policies";

function getHumanMessage(reason: any) {
  if (!reason) {
    return {
      message: "Request blocked for security reasons.",
      code: "UNKNOWN",
    };
  }

  const type = reason.type || reason.name;

  switch (type) {
    case "RATE_LIMIT":
      return {
        message: "Too many requests. Please slow down and try again.",
        code: "RATE_LIMIT",
      };

    case "BOT":
      return {
        message: "Automated activity detected. Please use the app normally.",
        code: "BOT",
      };

    case "SHIELD":
      return {
        message:
          "This request looks unsafe and was blocked for your protection.",
        code: "SHIELD",
      };

    default:
      return {
        message: "Your request was blocked by security policy.",
        code: "UNKNOWN",
      };
  }
}

export const protectAction = async (role: Role) => {
  try {
    const req = await request();

    const decision = await aj(role ?? "user").protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      const { message, code } = getHumanMessage(decision.reason);

      return {
        ok: false,
        message,
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("[Arcjet Error]", error);

    return {
      ok: false,
      message:
        "Security system temporarily unavailable. Please try again later.",
    };
  }
};
