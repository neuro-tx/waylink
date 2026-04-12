import arcjet from "@arcjet/next";
import { buildPolicy, Role } from "./policies";

export function aj(role: Role = "user", customRules?: any[]) {
  return arcjet({
    key: process.env.ARCJET_KEY!,
    rules: customRules ?? buildPolicy(role),
  });
}
