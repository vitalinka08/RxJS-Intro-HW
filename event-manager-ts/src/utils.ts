/**
 * Generic функція пошуку елемента за id.
 * Constraint `T extends { id: string }` гарантує наявність поля id.
 */
export function findById<T extends { readonly id: string }>(
  items: readonly T[],
  id: string
): T | undefined {
  return items.find((item) => item.id === id);
}

let counter = 0;
export function generateId(prefix = 'evt'): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${counter.toString().padStart(3, '0')}_${random}`;
}
