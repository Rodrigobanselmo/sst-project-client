export const get15Time = (
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  time15 = 1,
): string[] => {
  return Array.from(Array(24 * 4).keys())
    .map((hour) => {
      const hourTime = Math.floor(hour / 4);
      const minute = (hour % (4 / time15)) * 15 * time15;

      if (startHour > hourTime) return null;
      if (startHour === hourTime && startMinute > minute) return null;

      if (endHour < hourTime) return null;
      if (endHour === hourTime && endMinute < minute) return null;

      return `${hourTime < 10 ? '0' + hourTime : hourTime}:${
        minute < 10 ? '0' + minute : minute
      }`;
    })
    .filter((hour) => hour !== null) as string[];
};
