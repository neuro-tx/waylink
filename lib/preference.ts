import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_NAME = "wl_auto_open_dashboard";
export const MAX_AGE = 60 * 60 * 24 * 365;

function getSecret() {
  const secret = process.env.COOKIE_SIGNING_SECRET;
  if (!secret) {
    throw new Error("COOKIE_SIGNING_SECRET is not set");
  }

  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function encodeDashboardPreference(enabled: boolean) {
  const value = enabled ? "1" : "0";
  return `${value}.${sign(value)}`;
}

function verify(value: string, signature: string): boolean {
  const expected = sign(value);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function decode(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [value, signature] = cookieValue.split(".");
  if (!value || !signature || !verify(value, signature)) return false;
  return value === "1";
}
