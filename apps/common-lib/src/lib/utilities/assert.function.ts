/** Établit une assertion.
 * @param condition Condition à considérer.
 * @param message Message en cas d'echec
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function assert(condition: any, message?: string): asserts condition {
  if (!condition) throw new Error(message || 'Assertion failed!');
}
