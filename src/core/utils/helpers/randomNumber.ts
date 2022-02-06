export const randomNumber = (lenth: number): string => {
  const add = 1;
  let max = 12 - add;

  if (lenth > max) {
    return randomNumber(max) + randomNumber(lenth - max);
  }

  max = Math.pow(10, lenth + add);
  const min = max / 10;
  const number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ('' + number).substring(add);
};
