export interface SendFormReminderParams {
  companyId: string;
  applicationId: string;
}

export interface SendFormReminderResult {
  emailsSent: number;
  skippedAlreadyAnswered: number;
  skippedWithoutEmail: number;
  reminderCount: number;
  reminderLimit: number;
  remainingReminders: number;
  participants: {
    id: number;
    name: string;
    email: string;
    sent: boolean;
    error?: string;
  }[];
}
