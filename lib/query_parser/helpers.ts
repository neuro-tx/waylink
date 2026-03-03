import {
  eq,
  and,
  gt,
  gte,
  lt,
  lte,
  inArray,
  notInArray,
  like,
  ilike,
  isNull,
  isNotNull,
  between,
  SQL,
  desc,
  asc,
  ne,
  sql,
} from "drizzle-orm";
import { OrderByClause, SearchMode } from "./analyzer-types";

/**
 * Helper to build Drizzle WHERE conditions from parsed query plan
 *
 * @param whereClause - The where object from the parsed query plan
 * @param tableSchema - Your Drizzle table schema (e.g., products, location)
 * @returns SQL condition that can be used in .where()
 */
export function buildWhereConditions(
  whereClause: Record<string, any>,
  tableSchema: any,
): SQL | undefined {
  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(whereClause)) {
    const column = tableSchema[key];
    if (!column) {
      continue;
    }

    // Build condition based on value type
    const condition = buildCondition(column, value);
    if (condition) {
      conditions.push(condition);
    }
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

/**
 * Build a single condition for a field
 */
function buildCondition(column: any, value: any): SQL | undefined {
  // Handle null
  if (value === null) {
    return isNull(column);
  }

  // Handle simple values (string, number, boolean)
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return eq(column, value);
  }

  // Handle arrays (IN operator)
  if (Array.isArray(value)) {
    return inArray(column, value);
  }

  // Handle objects with operators
  if (typeof value === "object") {
    const conditions: SQL[] = [];

    for (const [operator, operatorValue] of Object.entries(value)) {
      let condition: SQL | undefined;

      switch (operator) {
        case "eq":
          condition = eq(column, operatorValue);
          break;

        case "ne":
          condition = ne(column, operatorValue);
          break;

        case "gt":
          condition = gt(column, operatorValue);
          break;

        case "gte":
          condition = gte(column, operatorValue);
          break;

        case "lt":
          condition = lt(column, operatorValue);
          break;

        case "lte":
          condition = lte(column, operatorValue);
          break;

        // make sure to covert the value into array
        case "in":
          condition = inArray(column, arrify(operatorValue));
          break;

        case "notIn":
          condition = notInArray(column, arrify(operatorValue));
          break;

        case "like":
          const likeValue =
            typeof operatorValue === "string"
              ? operatorValue
              : String(operatorValue);
          condition = like(column, likeValue);
          break;

        case "ilike":
          const ilikeValue =
            typeof operatorValue === "string"
              ? operatorValue
              : String(operatorValue);
          condition = ilike(column, ilikeValue);
          break;

        case "between":
          if (Array.isArray(operatorValue) && operatorValue.length === 2) {
            condition = between(column, operatorValue[0], operatorValue[1]);
          }
          break;

        case "isNull":
          condition = operatorValue ? isNull(column) : isNotNull(column);
          break;

        case "isNotNull":
          condition = operatorValue ? isNotNull(column) : isNull(column);
          break;

        default:
          console.warn(`Unknown operator: ${operator}`);
      }

      if (condition) {
        conditions.push(condition);
      }
    }

    return conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;
  }

  return undefined;
}

/**
 * Build ORDER BY clauses from parsed query plan
 */
export function buildOrderBy(orderByClause: OrderByClause[], tableSchema: any) {
  const orderByClauses = [];

  for (const order of orderByClause) {
    if (order.table) {
      continue;
    }

    const column = tableSchema[order.field];
    if (!column) {
      continue;
    }

    orderByClauses.push(
      order.direction === "DESC" ? desc(column) : asc(column),
    );
  }

  return orderByClauses;
}

function arrify<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

export function buildSearchQuery(
  column: any,
  term?: string,
  mode: SearchMode = "fts",
  language = "english",
): SQL | undefined {
  if (!term?.trim()) return undefined;

  const cleanTerm = term
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " & ");

  if (!cleanTerm) return undefined;

  if (mode === "fts") {
    return sql`${column} @@ to_tsquery(${language}, ${sql.raw(
      `'${cleanTerm}:*'`,
    )})`;
  }

  if (mode === "ilike") {
    return ilike(column, `%${cleanTerm}%`);
  }

  return undefined;
}

export function mergeWhere(...conditions: (SQL | undefined)[]) {
  const valid = conditions.filter(Boolean) as SQL[];

  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];

  return and(...valid);
}
