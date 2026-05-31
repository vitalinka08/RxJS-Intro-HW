export function findById<T extends { id: string }>(items: readonly T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

let counter = 0;
export function generateId(): string {
  counter += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `task_${counter.toString().padStart(3, '0')}_${random}`;
}
