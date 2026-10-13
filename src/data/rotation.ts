// Calendar dates, rather than elapsed hours, keep daily content stable across tabs.
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dayIndex(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

export function dailyItem<T>(items: readonly T[], date = new Date()): T | undefined {
  return items.length ? items[((dayIndex(date) % items.length) + items.length) % items.length] : undefined;
}

export function nextItem<T extends { id: string }>(items: readonly T[], currentId: string): T | undefined {
  if (!items.length) return undefined;
  return items[(items.findIndex(item => item.id === currentId) + 1) % items.length];
}
