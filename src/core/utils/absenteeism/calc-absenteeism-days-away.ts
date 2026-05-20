import dayjs, { Dayjs } from 'dayjs';

export function calcAbsenteeismDaysAway(
  start: Dayjs | Date,
  end: Dayjs | Date,
): number {
  const startDay = dayjs(start).startOf('day');
  const endDay = dayjs(end).startOf('day');
  const diff = Math.abs(startDay.diff(endDay, 'day'));

  return diff === 0 ? 1 : diff;
}
