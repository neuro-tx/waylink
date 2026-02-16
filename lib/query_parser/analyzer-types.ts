export type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "notIn"
  | "like"
  | "ilike"
  | "between"
  | "isNull"
  | "isNotNull";

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

export type SortDirection = "ASC" | "DESC" | "asc" | "desc";

export interface OrderByClause {
  field: string;
  direction: SortDirection;
  table?: string; // for joined tables (e.g., "location")
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
  search?: {
    // full-text search info
    term: string;
    fields: string[];
    mode: "fulltext" | "like";
  };
}

export type RawQueryParams =
  | string
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface QueryAnalyzerResult {
  success: boolean;
  query?: ParsedQuery;
  errors?: ValidationError[];
  warnings?: string[];
}

export interface QueryAnalyzerOptions {
  maxLimit?: number; // Maximum allowed limit (default: 100)
  defaultLimit?: number; // Default limit if not specified (default: 20)
  allowedFields?: string[]; // Whitelist of fields that can be filtered/sorted
  allowedRelations?: string[]; // Whitelist of relations that can be included
  searchFields?: string[]; // Fields to search in (for full-text search)
  searchMode?: "fulltext" | "like"; // Search mode
}
