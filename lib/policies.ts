import { shield, detectBot, tokenBucket } from "@arcjet/next";

export type Role = "admin" | "provider" | "user" | "guest";

export function buildPolicy(role: Role) {
  const based = [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: ["CATEGORY:SEARCH_ENGINE"] }),
  ];
  
  switch (role) {
    case "admin":
      return [
        ...based,
        tokenBucket({
          mode: "LIVE",
          capacity: 200,
          refillRate: 50,
          interval: 10,
        }),
      ];

    case "provider":
      return [
        ...based,
        tokenBucket({
          mode: "LIVE",
          capacity: 100,
          refillRate: 20,
          interval: 10,
        }),
      ];

    case "user":
      return [
        ...based,
        tokenBucket({
          mode: "LIVE",
          capacity: 50,
          refillRate: 10,
          interval: 10,
        }),
      ];

    case "guest":
    default:
      return [
        ...based,
        tokenBucket({
          mode: "LIVE",
          capacity: 30,
          refillRate: 5,
          interval: 10,
        }),
      ];
  }
}
