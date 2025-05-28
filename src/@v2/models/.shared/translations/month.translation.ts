type MonthTranslation = Record<
  number,
  {
    short: string;
    long: string;
  }
>;

export const monthTranslation: MonthTranslation = {
  1: {
    short: 'Jan',
    long: 'Janeiro',
  },
  2: {
    short: 'Fev',
    long: 'Fevereiro',
  },
  3: {
    short: 'Mar',
    long: 'Março',
  },
  4: {
    short: 'Abr',
    long: 'Abril',
  },
  5: {
    short: 'Mai',
    long: 'Maio',
  },
  6: {
    short: 'Jun',
    long: 'Junho',
  },
  7: {
    short: 'Jul',
    long: 'Julho',
  },
  8: {
    short: 'Ago',
    long: 'Agosto',
  },
  9: {
    short: 'Set',
    long: 'Setembro',
  },
  10: {
    short: 'Out',
    long: 'Outubro',
  },
  11: {
    short: 'Nov',
    long: 'Novembro',
  },
  12: {
    short: 'Dez',
    long: 'Dezembro',
  },
};
