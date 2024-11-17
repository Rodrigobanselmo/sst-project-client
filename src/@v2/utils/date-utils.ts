import dayjs from 'dayjs';

class DateUtils extends Date {
  constructor(date: Date | string | number = new Date()) {
    super(date);
  }

  static builder(date = new Date()) {
    return new DateUtils(date);
  }

  format(template = 'DD/MM/YYYY') {
    return dayjs(this).format(template);
  }
}

export const dateUtils = (date?: Date) => {
  return DateUtils.builder(date);
};
