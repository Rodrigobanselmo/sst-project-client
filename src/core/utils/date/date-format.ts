export const dateFormat = (str: string) => {
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
