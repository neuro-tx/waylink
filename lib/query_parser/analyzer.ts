import type {
  RawQueryParams,
  ParsedQuery,
  WhereClause,
  OrderByClause,
  ValidationError,
  QueryAnalyzerResult,
  QueryAnalyzerOptions,
  FilterOperator,
  JoinInfo,
} from "./analyzer-types";

/**
 * Simple Query Analyzer
 *
 * Parses URL query parameters and builds a query plan.
 */
export class QueryAnalyzer {
  private searchParams: URLSearchParams;
  private options: Required<QueryAnalyzerOptions>;
  private errors: ValidationError[] = [];
  private warnings: string[] = [];

  // Parsed components
  private whereClause: WhereClause = {};
  private orderByClause: OrderByClause[] = [];
  private joins: JoinInfo[] = [];
  private selectFields: string[] = [];
  private searchTerm?: string;

  constructor(queryParams: RawQueryParams, options?: QueryAnalyzerOptions) {
    // Convert to URLSearchParams if it's an object
    if (queryParams instanceof URLSearchParams) {
      this.searchParams = queryParams;
    } else {
      this.searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => this.searchParams.append(key, v));
          } else {
            this.searchParams.set(key, value);
          }
        }
      }
    }

    this.options = {
      maxLimit: options?.maxLimit ?? 100,
      defaultLimit: options?.defaultLimit ?? 20,
      allowedFields: options?.allowedFields ?? [],
      allowedRelations: options?.allowedRelations ?? [],
      searchFields: options?.searchFields ?? [],
      searchMode: options?.searchMode ?? "like",
    };
  }

  /**
   * Get a parameter value (handles single or multiple values)
   */
  private getParam(key: string): string | undefined {
    return this.searchParams.get(key) ?? undefined;
  }

  /**
   * Get all parameter values for a key
   */
  private getAllParams(key: string): string[] {
    return this.searchParams.getAll(key);
  }

  /**
   * Check if a parameter exists
   */
  private hasParam(key: string): boolean {
    return this.searchParams.has(key);
  }

  /**
   * Get all parameter keys
   */
  private getAllKeys(): string[] {
    const keys: string[] = [];
    this.searchParams.forEach((_, key) => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }

  /**
   * Main parse method - returns the query plan
   */
  public parse(): QueryAnalyzerResult {
    try {
      this.parseFilters();
      this.parseSort();
      this.parseSearch();
      this.parseIncludes();
      this.parseSelect();

      const pagination = this.parsePagination();

      if (this.errors.length > 0) {
        return {
          success: false,
          errors: this.errors,
          warnings: this.warnings,
        };
      }

      const query: ParsedQuery = {
        where: this.whereClause,
        orderBy: this.orderByClause,
        limit: pagination.limit,
        offset: pagination.offset,
        joins: this.joins.length > 0 ? this.joins : undefined,
        select: this.selectFields.length > 0 ? this.selectFields : undefined,
        search: this.searchTerm
          ? {
              term: this.searchTerm,
              fields: this.options.searchFields,
              mode: this.options.searchMode,
            }
          : undefined,
      };

      return {
        success: true,
        query,
        warnings: this.warnings.length > 0 ? this.warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            field: "general",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      };
    }
  }

  /**
   * Parse filter parameters
   * Supports: ?status=active, ?basePrice[gte]=100, ?location.city=Cairo
   */
  private parseFilters(): void {
    for (const key of this.getAllKeys()) {
      // Skip special parameters
      if (this.isSpecialParam(key)) {
        continue;
      }

      const value = this.getParam(key);

      // Check if it's a relation filter (e.g., "location.city")
      if (key.includes(".")) {
        this.parseRelationFilter(key, value);
        continue;
      }

      // Check whitelist if provided
      if (
        this.options.allowedFields.length > 0 &&
        !this.options.allowedFields.includes(key.replace(/\[.*\]/, ""))
      ) {
        this.warnings.push(`Field ${key} is not in allowed fields list`);
        continue;
      }

      // Parse operator from key (e.g., "basePrice[gte]")
      const { fieldName, operator } = this.parseFieldOperator(key);

      // Parse and validate value
      const parsedValue = this.parseFilterValue(value, operator);

      // Add to where clause
      if (operator && operator !== "eq") {
        this.whereClause[fieldName] = { [operator]: parsedValue };
      } else {
        this.whereClause[fieldName] = parsedValue;
      }
    }
  }

  /**
   * Parse relation filters (e.g., location.city=Cairo)
   */
  private parseRelationFilter(key: string, value: string | undefined): void {
    const parts = key.split(".");

    if (parts.length < 2) {
      this.errors.push({
        field: key,
        message: "Invalid relation filter format. Use: relation.field",
      });
      return;
    }

    const relationName = parts[0];
    const fieldPath = parts.slice(1).join(".");

    // Check whitelist if provided
    if (
      this.options.allowedRelations.length > 0 &&
      !this.options.allowedRelations.includes(relationName)
    ) {
      this.warnings.push(
        `Relation ${relationName} is not in allowed relations list`,
      );
      return;
    }

    // Mark that we need to join this table
    this.addJoinIfNotExists(relationName);

    // Parse operator if present
    const { fieldName, operator } = this.parseFieldOperator(fieldPath);

    // Parse value
    const parsedValue = this.parseFilterValue(value, operator);

    // Add to where clause with relation prefix
    const whereKey = `${relationName}.${fieldName}`;
    if (operator && operator !== "eq") {
      this.whereClause[whereKey] = { [operator]: parsedValue };
    } else {
      this.whereClause[whereKey] = parsedValue;
    }
  }

  /**
   * Parse field name and operator from query parameter
   * Examples: "basePrice[gte]" -> { fieldName: "basePrice", operator: "gte" }
   */
  private parseFieldOperator(key: string): {
    fieldName: string;
    operator?: FilterOperator;
  } {
    const match = key.match(/^(.+?)\[(\w+)\]$/);
    if (match) {
      return {
        fieldName: match[1],
        operator: match[2] as FilterOperator,
      };
    }
    return { fieldName: key };
  }

  /**
   * Parse and validate filter value
   */
  private parseFilterValue(
    value: string | undefined,
    operator?: FilterOperator,
  ): any {
    if (value === undefined || value === null) {
      return null;
    }

    // Handle array values for IN/NOT IN operators
    if (operator === "in" || operator === "notIn") {
      const values = value.split(",");
      return values.map((v) => this.coerceValue(v.trim()));
    }

    // Handle BETWEEN operator (expects comma-separated values)
    if (operator === "between") {
      const values = value.split(",");
      if (values.length !== 2) {
        this.errors.push({
          field: "filter",
          message: "BETWEEN operator requires two comma-separated values",
          value: value,
        });
        return null;
      }
      return values.map((v) => this.coerceValue(v.trim()));
    }

    // Handle null/boolean operators
    if (operator === "isNull" || operator === "isNotNull") {
      return value === "true" || value === "1";
    }

    return this.coerceValue(value);
  }

  /**
   * Try to coerce string value to appropriate type
   * Just basic conversion - you can enhance this
   */
  private coerceValue(value: string): any {
    // Check for number
    if (/^-?\d+\.?\d*$/.test(value)) {
      return parseFloat(value);
    }

    // Check for boolean
    if (value === "true") return true;
    if (value === "false") return false;

    // Check for date (ISO format)
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Return as string
    return value;
  }

  /**
   * Parse sort parameters
   * Format: ?sort=-createdAt,title or ?sort=location.city,-basePrice
   */
  private parseSort(): void {
    const sortParam = this.getParam("sort");
    if (!sortParam) {
      return;
    }

    const sortFields = sortParam.split(",");
    for (const field of sortFields) {
      this.parseSortField(field.trim());
    }
  }

  /**
   * Parse individual sort field
   */
  private parseSortField(field: string): void {
    const direction: "ASC" | "DESC" = field.startsWith("-") ? "DESC" : "ASC";
    const fieldName = field.replace(/^[-+]/, "");

    // Check if it's a relation sort (e.g., "location.city")
    if (fieldName.includes(".")) {
      const [relationName, relFieldName] = fieldName.split(".", 2);

      // Check whitelist
      if (
        this.options.allowedRelations.length > 0 &&
        !this.options.allowedRelations.includes(relationName)
      ) {
        this.warnings.push(
          `Cannot sort by relation ${relationName} - not in allowed list`,
        );
        return;
      }

      // Mark that we need to join this table
      this.addJoinIfNotExists(relationName);

      this.orderByClause.push({
        field: relFieldName,
        direction,
        table: relationName,
      });
      return;
    }

    // Regular field sort
    // Check whitelist
    if (
      this.options.allowedFields.length > 0 &&
      !this.options.allowedFields.includes(fieldName)
    ) {
      this.warnings.push(
        `Cannot sort by field ${fieldName} - not in allowed list`,
      );
      return;
    }

    this.orderByClause.push({ field: fieldName, direction });
  }

  /**
   * Parse full-text search
   */
  private parseSearch(): void {
    const searchTerm = this.getParam("search");
    if (!searchTerm) {
      return;
    }

    if (this.options.searchFields.length === 0) {
      this.warnings.push("Search requested but no search fields configured");
      return;
    }

    this.searchTerm = searchTerm;
  }

  /**
   * Parse pagination
   */
  private parsePagination(): { limit: number; offset: number } {
    let limit = this.options.defaultLimit;
    let offset = 0;

    const limitParam = this.getParam("limit");
    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 1) {
        this.errors.push({
          field: "limit",
          message: "Invalid limit value",
          value: limitParam,
        });
        limit = this.options.defaultLimit;
      } else if (limit > this.options.maxLimit) {
        this.warnings.push(
          `Limit exceeds maximum (${this.options.maxLimit}), using maximum`,
        );
        limit = this.options.maxLimit;
      }
    }

    const offsetParam = this.getParam("offset");
    if (offsetParam) {
      offset = parseInt(offsetParam, 10);
      if (isNaN(offset) || offset < 0) {
        this.errors.push({
          field: "offset",
          message: "Invalid offset value",
          value: offsetParam,
        });
        offset = 0;
      }
    } else {
      const pageParam = this.getParam("page");
      if (pageParam) {
        const page = parseInt(pageParam, 10);
        if (!isNaN(page) && page > 0) {
          offset = (page - 1) * limit;
        }
      }
    }

    return { limit, offset };
  }

  /**
   * Parse include/relations to load
   */
  private parseIncludes(): void {
    const includeParam = this.getParam("include");
    if (!includeParam) {
      return;
    }

    const includes = includeParam.split(",").map((i) => i.trim());
    for (const relationName of includes) {
      // Check whitelist
      if (
        this.options.allowedRelations.length > 0 &&
        !this.options.allowedRelations.includes(relationName)
      ) {
        this.warnings.push(`Relation ${relationName} is not in allowed list`);
        continue;
      }

      this.addJoinIfNotExists(relationName);
    }
  }

  /**
   * Parse select fields
   */
  private parseSelect(): void {
    const fieldsParam = this.getParam("fields");
    if (!fieldsParam) {
      return;
    }

    const fields = fieldsParam.split(",").map((f) => f.trim());
    for (const field of fields) {
      // Check whitelist
      if (
        this.options.allowedFields.length > 0 &&
        !this.options.allowedFields.includes(field)
      ) {
        this.warnings.push(`Field ${field} is not in allowed list`);
        continue;
      }

      this.selectFields.push(field);
    }
  }

  /**
   * Add join info if not already present
   */
  private addJoinIfNotExists(relationName: string): void {
    if (this.joins.some((j) => j.table === relationName)) {
      return;
    }

    // Add basic join info - you'll fill in the details when you use it
    this.joins.push({
      table: relationName,
      alias: relationName,
      localField: `${relationName}Id`, // Convention: locationId for location table
      foreignField: "id",
      type: "LEFT",
    });
  }

  /**
   * Check if parameter is a special query parameter
   */
  private isSpecialParam(key: string): boolean {
    return [
      "sort",
      "page",
      "limit",
      "offset",
      "search",
      "include",
      "fields",
    ].includes(key);
  }
}

/**
 * Helper function to quickly parse a query
 */
export function parseQuery(
  queryParams: RawQueryParams,
  options?: QueryAnalyzerOptions,
): QueryAnalyzerResult {
  const analyzer = new QueryAnalyzer(queryParams, options);
  return analyzer.parse();
}
