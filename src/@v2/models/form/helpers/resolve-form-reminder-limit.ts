/** Fallback only when the API omits `reminderLimit` during rollout. Source of truth is the API. */
export const FORM_REMINDER_LIMIT_FALLBACK = 4;

export function resolveClientFormReminderLimit(params: {
  reminderLimit?: number | null;
  additionalReminderLimit?: number | null;
}): number {
  if (
    typeof params.reminderLimit === 'number' &&
    Number.isFinite(params.reminderLimit) &&
    params.reminderLimit >= 0
  ) {
    return Math.trunc(params.reminderLimit);
  }

  const additional =
    typeof params.additionalReminderLimit === 'number' &&
    Number.isFinite(params.additionalReminderLimit)
      ? Math.max(0, Math.trunc(params.additionalReminderLimit))
      : 0;

  return FORM_REMINDER_LIMIT_FALLBACK + additional;
}
