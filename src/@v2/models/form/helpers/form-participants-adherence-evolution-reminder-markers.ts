import type {
  IFormParticipantsAdherenceEvolutionInitialEmail,
  IFormParticipantsAdherenceEvolutionReminder,
} from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';
import { toSaoPauloDateKeyFromIso } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';

export const EMAIL_INITIAL_MARKER_LABEL = 'E-mail inicial';
export const EMAIL_INITIAL_MARKER_LABEL_COMPACT = 'Envio inicial';

export type AdherenceEmailMarkerLabelStyle = 'default' | 'compact';

export type AdherenceEmailMarkerGroup = {
  date: string;
  index: number;
  labels: string[];
};

export function emailInitialLabel(
  style: AdherenceEmailMarkerLabelStyle = 'default',
): string {
  return style === 'compact'
    ? EMAIL_INITIAL_MARKER_LABEL_COMPACT
    : EMAIL_INITIAL_MARKER_LABEL;
}

export function emailReminderLabel(
  round: number,
  style: AdherenceEmailMarkerLabelStyle = 'default',
): string {
  return style === 'compact' ? `Reforço ${round}` : `E-mail — Reforço ${round}`;
}

export function groupAdherenceEmailMarkersOnSeries(
  seriesDates: string[],
  reminders: IFormParticipantsAdherenceEvolutionReminder[] | undefined,
  initialEmail?: IFormParticipantsAdherenceEvolutionInitialEmail | null,
  labelStyle: AdherenceEmailMarkerLabelStyle = 'default',
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
    pushLabel(initialEmail.sentAt, emailInitialLabel(labelStyle));
  }

  for (const reminder of reminders ?? []) {
    pushLabel(reminder.sentAt, emailReminderLabel(reminder.round, labelStyle));
  }

  return [...labelsByIndex.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, labels]) => ({
      date: seriesDates[index],
      index,
      labels,
    }));
}
