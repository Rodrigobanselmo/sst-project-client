import dayjs from 'dayjs';

export const getTimeList = (
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  range = 15,
): string[] => {
  const multiple = 60 / range;

  return Array.from(Array(24 * multiple).keys())
    .map((hour) => {
      const hourTime = Math.floor(hour / multiple);
      const minute = (hour % multiple) * range;

      if (startHour > hourTime) return null;
      if (startHour === hourTime && startMinute > minute) return null;

      if (endHour < hourTime) return null;
      if (endHour === hourTime && endMinute < minute) return null;

      return `${String(hourTime).padStart(2, '0')}:${String(minute).padStart(
        2,
        '0',
      )}`;
    })
    .filter((hour) => hour !== null) as string[];
};

export const getDateWithTime = (time: string, date?: Date) => {
  const [h, m] = (time || '').split(':');

  return dayjs(date || new Date())
    .set('hour', Number(h || 0))
    .set('minute', Number(m || 0))
    .toDate();
};

export const getTimeFromDate = (date: Date) => {
  const dt = dayjs(date);
  return `${String(dt.get('hour')).padStart(2, '0')}:${String(
    dt.get('minute'),
  ).padStart(2, '0')}`;
};

export const addTimeToDate = (time: string, date?: Date) => {
  const [h, m] = (time || '').split(':');

  const addDateTime = dayjs(date || new Date())
    .add(Number(h || 0), 'hour')
    .add(Number(m || 0), 'minute');

  return getTimeFromDate(addDateTime.toDate());
};

export const addMinutesToTime = (time: string, minutes: number) => {
  const date = getDateWithTime(time);
  const addDateTime = dayjs(date).add(minutes, 'minute');

  return getTimeFromDate(addDateTime.toDate());
};

export const getTimeFromMinutes = (minutes: number) => {
  const min = minutes % 60;
  const hr = Math.floor(minutes / 60);

  return `${String(min).padStart(2, '0')}:${String(hr).padStart(2, '0')}`;
};
