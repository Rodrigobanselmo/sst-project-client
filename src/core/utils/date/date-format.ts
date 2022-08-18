import dayjs from 'dayjs';

export const dateFormat = (str?: string) => {
  if (!str) return undefined;

  const splitStr = str.split('/');
  if (splitStr.length === 3) {
    const day = splitStr[0];
    const month = splitStr[1];
    const year = splitStr[2];

    if (day && month && year) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date;
    }
  }

  if (splitStr.length === 2) {
    const day = 1;
    const month = splitStr[0];
    const year = splitStr[1];

    if (day && month && year) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return date;
    }
  }
  return new Date(str);
};

export const dateToString = (
  date: Date | null | undefined,
  format = 'DD/MM/YYYY',
) => {
  return date ? dayjs(date).format(format) : '';
};

export const dateToDate = (date: Date | null | undefined) => {
  return date ? dayjs(date).set('h', 0).toDate() : undefined;
};

export const dateToDateLessTime = (date: Date | null | undefined) => {
  return date
    ? dayjs(date).set('h', 0).set('m', 0).set('s', 0).set('ms', 0).toDate()
    : undefined;
};

export const dateFromNow = (date: Date | null | undefined) => {
  return dayjs(date).fromNow();
};

export const dateFromNowInDays = (date: Date | null | undefined) => {
  const diffInHours = Math.abs(dayjs(date).diff(dayjs(), 'h'));
  const isNearDate = diffInHours < 24;

  if (isNearDate) {
    const isToday = dayjs().isSame(date, 'day');
    if (isToday) return 'hoje';

    const isBefore = dayjs(date).isBefore(dayjs());
    if (isBefore) return 'ontem';
    if (!isBefore) return 'amanhã';
  }
  const fromDate = dayjs(date).fromNow();

  return fromDate;
};
