// ============================================================================
// CORE TYPES FOR QUERY ANALYZER
// ============================================================================

/**
 * Supported filter operators
 */
export type FilterOperator =
  | "eq" // equals
  | "ne" // not equals
  | "gt" // greater than
  | "gte" // greater than or equal
  | "lt" // less than
  | "lte" // less than or equal
  | "in" // in array
  | "notIn" // not in array
  | "like" // LIKE pattern
  | "ilike" // case-insensitive LIKE
  | "between" // between two values
  | "isNull" // is null
  | "isNotNull"; // is not null

/**
 * Filter value with operator
 */
export type FilterValue =
  | string
  | number
  | boolean
  | Date
  | null
  | string[]
  | number[]
  | { [K in FilterOperator]?: any };

/**
 * Where clause structure - can be nested with AND/OR/NOT
 */
export type WhereClause = {
  [field: string]: FilterValue | WhereClause[];
} & {
  AND?: WhereClause[];
  OR?: WhereClause[];
  NOT?: WhereClause;
};

/**
 * Sort direction
 */
export type SortDirection = "ASC" | "DESC" | "asc" | "desc";

/**
 * Order by clause
 */
export interface OrderByClause {
  field: string;
  direction: SortDirection;
  table?: string; // for joined tables (e.g., "location")
}

/**
 * Join/Relation information
 */
export interface JoinInfo {
  table: string; // related table name (e.g., "location")
  alias?: string; // alias for the join
  localField: string; // field in main table (e.g., "locationId")
  foreignField: string; // field in related table (e.g., "id")
  type?: "INNER" | "LEFT" | "RIGHT";
}

/**
 * Parsed query result - this is the "plan"
 */
export interface ParsedQuery {
  where: WhereClause;
  orderBy: OrderByClause[];
  limit: number;
  offset: number;
  select?: string[]; // fields to select
  joins?: JoinInfo[]; // tables to join
  search?: {
    // full-text search info
    term: string;
    fields: string[];
    mode: "fulltext" | "like";
  };
}

/**
 * Raw query parameters from URL
 * Can be either URLSearchParams (from Next.js/browser) or a plain object (from Express)
 */
export type RawQueryParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Query analyzer result
 */
export interface QueryAnalyzerResult {
  success: boolean;
  query?: ParsedQuery; // The parsed query plan
  errors?: ValidationError[];
  warnings?: string[];
}

/**
 * Options for the query analyzer
 */
export interface QueryAnalyzerOptions {
  maxLimit?: number; // Maximum allowed limit (default: 100)
  defaultLimit?: number; // Default limit if not specified (default: 20)
  allowedFields?: string[]; // Whitelist of fields that can be filtered/sorted
  allowedRelations?: string[]; // Whitelist of relations that can be included
  searchFields?: string[]; // Fields to search in (for full-text search)
  searchMode?: "fulltext" | "like"; // Search mode
}
