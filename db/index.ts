import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schemas";

const dbUrl = process.env.DATABASE_URL as string;
if (!dbUrl) throw new Error("DATABASE_URL is missing");

const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
