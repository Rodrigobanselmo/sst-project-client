import dayjs from 'dayjs';

export function addBusinessDays(startDate: Date, numDays: number) {
  const dayjsStartDate = dayjs(startDate);
  let remainingDays = numDays + 1;
  let currentDate = dayjsStartDate;

  while (remainingDays > 0) {
    // Check if the current date is a weekend day (Saturday or Sunday)
    const isWeekend = currentDate.day() === 6 || currentDate.day() === 0;

    if (!isWeekend) {
      remainingDays--;
    }

    currentDate = currentDate.add(1, 'day');
  }

  // Return the last valid business day
  return currentDate.subtract(1, 'day').toDate();
}
