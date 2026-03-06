/**
 * Result Type for Better Error Handling
 *
 * Provides a type-safe way to handle success/failure cases
 * without throwing exceptions for expected error conditions.
 */

/**
 * Represents either a successful result with data or a failure with an error
 */
export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

/**
 * Helper function to create a success result
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Helper function to create a failure result
 */
export function failure<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Type guard to check if result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
}

/**
 * Type guard to check if result is a failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

/**
 * Unwrap a result, throwing if it's a failure
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/**
 * Unwrap a result with a default value for failures
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}
