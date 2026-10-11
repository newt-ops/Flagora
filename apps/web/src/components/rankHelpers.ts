const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function formatSeasonName(seasonStr?: string | null): string {
  if (seasonStr) {
    const match = /^(\d{4})-(\d{2})$/.exec(seasonStr.trim());
    if (match) {
      const year = match[1];
      const monthIndex = parseInt(match[2], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${MONTH_NAMES[monthIndex]} ${year}`;
      }
    }
  }

  const now = new Date();
  return `${MONTH_NAMES[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
}

export interface RatingDeltaDisplay {
  text: string;
  colorClass: string;
  isPositive: boolean;
  isNegative: boolean;
}

export function getRatingDeltaDisplay(delta?: number | null): RatingDeltaDisplay {
  if (delta === undefined || delta === null) {
    return {
      text: '0',
      colorClass: 'text-tg-hint',
      isPositive: false,
      isNegative: false,
    };
  }

  if (delta > 0) {
    return {
      text: `+${delta}`,
      colorClass: 'text-tg-button',
      isPositive: true,
      isNegative: false,
    };
  }

  if (delta < 0) {
    return {
      text: `${delta}`,
      colorClass: 'text-tg-destructive',
      isPositive: false,
      isNegative: true,
    };
  }

  return {
    text: '0',
    colorClass: 'text-tg-hint',
    isPositive: false,
    isNegative: false,
  };
}
