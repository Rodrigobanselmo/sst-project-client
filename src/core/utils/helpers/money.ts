import { onlyNumbers } from '@brazilian-utils/brazilian-utils';

export const moneyConverter = (money: string) => {
  if (!money) return 0;
  const splitMoney = money.split(',');

  const numbs = onlyNumbers(splitMoney[0]);
  const cents = onlyNumbers(splitMoney[1]).substring(0, 2);

  const intMoney =
    numbs +
    (cents.length === 0 ? '00' : cents.length === 1 ? cents + '0' : cents);

  return Number(intMoney);
};
