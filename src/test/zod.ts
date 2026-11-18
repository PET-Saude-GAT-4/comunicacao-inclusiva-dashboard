import { flattenError, type ZodSafeParseResult } from "zod";

// The per-field messages a form would show, or {} when the input is valid.
export function fieldErrors<T>(
  result: ZodSafeParseResult<T>,
): Partial<Record<keyof T, string[]>> {
  if (result.success) return {};
  return flattenError(result.error).fieldErrors as Partial<
    Record<keyof T, string[]>
  >;
}
