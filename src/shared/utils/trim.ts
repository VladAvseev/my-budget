function trimValue(value: unknown): unknown {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(trimValue);
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      result[key] = trimValue(item);
    }
    return result;
  }
  return value;
}

export function trimStrings<T>(value: T): T {
  return trimValue(value) as T;
}