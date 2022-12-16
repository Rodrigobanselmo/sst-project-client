export enum RiskEnum {
  FIS = 'FIS',
  QUI = 'QUI',
  BIO = 'BIO',
  ERG = 'ERG',
  ACI = 'ACI',
  OUTROS = 'OUTROS',
}

export const riskEnumList = [
  RiskEnum.FIS,
  RiskEnum.QUI,
  RiskEnum.BIO,
  RiskEnum.ERG,
  RiskEnum.ACI,
];

export const RiskMap: Record<RiskEnum, { type: RiskEnum; name: string }> = {
  [RiskEnum.FIS]: {
    type: RiskEnum.FIS,
    name: 'Físico',
  },
  [RiskEnum.QUI]: {
    type: RiskEnum.QUI,
    name: 'Químico',
  },
  [RiskEnum.BIO]: {
    type: RiskEnum.BIO,
    name: 'Biológico',
  },
  [RiskEnum.ERG]: {
    type: RiskEnum.ERG,
    name: 'Ergonômico',
  },
  [RiskEnum.ACI]: {
    type: RiskEnum.ACI,
    name: 'Acidente',
  },
  [RiskEnum.OUTROS]: {
    type: RiskEnum.OUTROS,
    name: 'Outros',
  },
};

export enum RiskOrderEnum {
  FIS = 1,
  QUI = 2,
  BIO = 3,
  ERG = 4,
  ACI = 5,
  OUTROS = 0,
}

export const UnMedList = [
  'dose diária de ruído',
  'dB (linear)',
  'dB(C)',
  'dB(A)',
  'm/s2',
  'm/s1,75',
  'ppm',
  'mg/m3',
  'f/cm3',
  'ºC',
  'm/s',
  '%',
  'lx',
  'ufc/m3',
  'dose diária',
  'dose mensal',
  'dose trimestral',
  'dose anual',
  'W/m2',
  'A/m',
  'mT',
  'μT',
  'mA',
  'kV/m',
  'V/m',
  'J/m2',
  'mJ/cm2',
  'mSv',
  'mppdc',
  'UR (%)',
];
