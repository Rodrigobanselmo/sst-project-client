export const isNaEpi = (ca: string) => ['1', '2', '0'].includes(ca);

export const isNaRecMed = (name: string) =>
  ['Não aplicável', 'Não identificada', 'Não informada'].includes(name);
