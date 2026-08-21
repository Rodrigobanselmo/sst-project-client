export interface GrantFormReminderLimitParams {
  companyId: string;
  applicationId: string;
  quantity: number;
  reason?: string;
}

export interface GrantFormReminderLimitResult {
  reminderCount: number;
  additionalReminderLimit: number;
  reminderLimit: number;
  quantityAdded: number;
  previousAdditionalLimit: number;
  previousReminderLimit: number;
}
