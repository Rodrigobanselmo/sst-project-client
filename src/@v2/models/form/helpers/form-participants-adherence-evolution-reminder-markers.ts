import type { IFormParticipantsAdherenceEvolutionReminder } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';
import { toSaoPauloDateKeyFromIso } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';

export type AdherenceReminderMarkerGroup = {
  date: string;
  index: number;
  rounds: number[];
};

export function groupAdherenceRemindersOnSeries(
  seriesDates: string[],
  reminders: IFormParticipantsAdherenceEvolutionReminder[] | undefined,
): AdherenceReminderMarkerGroup[] {
  if (!seriesDates.length || !reminders?.length) return [];

  const indexByDate = new Map(seriesDates.map((date, index) => [date, index]));
  const roundsByIndex = new Map<number, number[]>();

  for (const reminder of reminders) {
    const dateKey = toSaoPauloDateKeyFromIso(reminder.sentAt);
    if (!dateKey) continue;
    const index = indexByDate.get(dateKey);
    if (index == null) continue;
    const rounds = roundsByIndex.get(index) ?? [];
    rounds.push(reminder.round);
    roundsByIndex.set(index, rounds);
  }

  return [...roundsByIndex.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, rounds]) => ({
      date: seriesDates[index],
      index,
      rounds: [...rounds].sort((a, b) => a - b),
    }));
}

export function reminderLabel(round: number): string {
  return `Reforço ${round}`;
}
