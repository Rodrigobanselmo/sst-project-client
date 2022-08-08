export const getMoney = (money?: number) => {
  if (typeof money !== 'number') return '-';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(money) / 100);
};
