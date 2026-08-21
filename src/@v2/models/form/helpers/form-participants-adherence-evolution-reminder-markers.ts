import type {
  IFormParticipantsAdherenceEvolutionInitialEmail,
  IFormParticipantsAdherenceEvolutionReminder,
} from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';
import { toSaoPauloDateKeyFromIso } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';

export const EMAIL_INITIAL_MARKER_LABEL = 'E-mail inicial';

export type AdherenceEmailMarkerGroup = {
  date: string;
  index: number;
  labels: string[];
};

export function emailReminderLabel(round: number): string {
  return `E-mail — Reforço ${round}`;
}

export function groupAdherenceEmailMarkersOnSeries(
  seriesDates: string[],
  reminders: IFormParticipantsAdherenceEvolutionReminder[] | undefined,
  initialEmail?: IFormParticipantsAdherenceEvolutionInitialEmail | null,
): AdherenceEmailMarkerGroup[] {
  if (!seriesDates.length) return [];

  const indexByDate = new Map(seriesDates.map((date, index) => [date, index]));
  const labelsByIndex = new Map<number, string[]>();

  const pushLabel = (sentAt: string, label: string) => {
    const dateKey = toSaoPauloDateKeyFromIso(sentAt);
    if (!dateKey) return;
    const index = indexByDate.get(dateKey);
    if (index == null) return;
    const labels = labelsByIndex.get(index) ?? [];
    labels.push(label);
    labelsByIndex.set(index, labels);
  };

  if (initialEmail?.sentAt) {
    pushLabel(initialEmail.sentAt, EMAIL_INITIAL_MARKER_LABEL);
  }

  for (const reminder of reminders ?? []) {
    pushLabel(reminder.sentAt, emailReminderLabel(reminder.round));
  }

  return [...labelsByIndex.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, labels]) => ({
      date: seriesDates[index],
      index,
      labels,
    }));
}
