import { NextRequest, NextResponse } from "next/server";

import { Errors, isApiError } from "./errors";
import { Role } from "./policies";
import { aj } from "./arcjet";
type Result<T, E = Error> = [T, null] | [null, E];

/**
 * Value, Promise, or function that returns them
 */
export type MaybeAsync<T> = T | Promise<T> | (() => T | Promise<T>);

async function execute<T>(target: MaybeAsync<T>): Promise<T> {
  if (typeof target === "function") {
    return await (target as () => T | Promise<T>)();
  }

  return await target;
}

export async function tryCatch<T>(
  req: NextRequest,
  target: MaybeAsync<T>,
  options?: {
    role?: Role;
    arcjetRules?: any[];
  },
): Promise<NextResponse> {
  try {
    const role = options?.role ?? "guest";
    const arc = aj(role, options?.arcjetRules);
    const decision = await arc.protect(req, { requested: 1 });
    console.log(decision);
    if (decision.isDenied()) {
      throw Errors.forbidden(getArcjetMessage(decision.reason));
    }

    const data = await execute(target);

    if (data == null || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json(
        {
          status: "empty",
          message: "No data found",
          data: [],
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.error("[API]", error);

    if (isApiError(error)) {
      return NextResponse.json(
        {
          status: "error",
          code: error.code,
          message: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    return NextResponse.json(
      {
        status: "error",
        code: "SERVER_ERROR",
        message: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}

function getArcjetMessage(reason: any): string {
  if (!reason) return "Request blocked.";

  const type = reason.type || reason.name;

  switch (type) {
    case "RATE_LIMIT":
      return "Too many requests. Please wait a moment and try again.";

    case "BOT":
      return "Automated traffic detected. Please use the app normally.";

    case "SHIELD":
      return "Suspicious request blocked for your security.";

    default:
      return "Your request was blocked by security policy.";
  }
}
