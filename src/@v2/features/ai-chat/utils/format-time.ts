/**
 * Format a date to a time string like "13:45"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format a date to a full date/time string for tooltips
 */
export function formatFullDateTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format a date to relative time ("2 min ago", "1 hour ago") or actual time for older messages
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  // Less than 1 minute
  if (diffSeconds < 60) {
    return 'agora';
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    return `${diffMinutes} minutos atrás`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hora atrás' : `${diffHours} horas atrás`;
  }

  // More than 24 hours - show the actual time
  return formatTime(date);
}

/**
 * Get a date separator label like "Today", "Yesterday", or "Feb 18"
 */
export function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = isSameDay(date, today);
  const isYesterday = isSameDay(date, yesterday);

  if (isToday) return 'Hoje';
  if (isYesterday) return 'Ontem';

  return date.toLocaleDateString('pt-BR', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates should show a date separator between them
 */
export function shouldShowDateSeparator(
  currentDate: Date,
  previousDate: Date | null,
): boolean {
  if (!previousDate) return true;
  return !isSameDay(currentDate, previousDate);
}
