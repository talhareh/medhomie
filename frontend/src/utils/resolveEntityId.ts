/** Normalize a MongoDB ref (string, ObjectId, or populated doc) to a string id. */
export function resolveEntityId(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object') {
    const ref = value as { _id?: unknown; id?: unknown };
    if (ref._id !== null && ref._id !== undefined) return String(ref._id);
    if (ref.id !== null && ref.id !== undefined) return String(ref.id);
  }
  return String(value);
}
