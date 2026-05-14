export type DashboardDateValue = Date | string | null | undefined;

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(date);
}

export function getDateValue(value: DashboardDateValue) {
  return value ? new Date(value).getTime() : 0;
}

export function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export function sortByUpdatedDesc<
  T extends {
    createdAt?: DashboardDateValue;
    updatedAt?: DashboardDateValue;
  },
>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftValue = getDateValue(left.updatedAt ?? left.createdAt);
    const rightValue = getDateValue(right.updatedAt ?? right.createdAt);

    return rightValue - leftValue;
  });
}

export function sortByDateAsc<T>(
  items: T[],
  pick: (item: T) => DashboardDateValue
) {
  return [...items].sort((left, right) => getDateValue(pick(left)) - getDateValue(pick(right)));
}

export function sortByDateDesc<T>(
  items: T[],
  pick: (item: T) => DashboardDateValue
) {
  return [...items].sort((left, right) => getDateValue(pick(right)) - getDateValue(pick(left)));
}
