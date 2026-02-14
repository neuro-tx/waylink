import { NextResponse } from "next/server";

import { isApiError } from "./errors";

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
  target: MaybeAsync<T>,
  options?: {
    emptyMessage?: string;
    successStatus?: number;
  },
): Promise<NextResponse> {
  try {
    const data = await execute(target);

    if (data == null || (Array.isArray(data) && data.length === 0)) {
      return NextResponse.json(
        {
          status: "empty",
          message: options?.emptyMessage ?? "No data found",
          data: null
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data,
      },
      {
        status: options?.successStatus ?? 200,
      },
    );
  } catch (error) {
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
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
