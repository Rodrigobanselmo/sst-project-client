export enum ExposureTypeEnum {
  HP = 'HP',
  O = 'O',
  HI = 'HI',
}

export const ExposureTypeMap: Record<
  ExposureTypeEnum,
  { name: string; colorSchema: 'error' | 'success' | 'warning' }
> = {
  [ExposureTypeEnum.HP]: { colorSchema: 'error', name: 'Habitual/Permanente' },
  [ExposureTypeEnum.O]: { colorSchema: 'success', name: 'Ocasional' },
  [ExposureTypeEnum.HI]: {
    colorSchema: 'warning',
    name: 'Habitual/Intermitente',
  },
};

export const ExposureTypeArray = [
  {
    value: ExposureTypeEnum.HP,
    label: ExposureTypeMap[ExposureTypeEnum.HP].name,
  },
  {
    value: ExposureTypeEnum.O,
    label: ExposureTypeMap[ExposureTypeEnum.O].name,
  },
  {
    value: ExposureTypeEnum.HI,
    label: ExposureTypeMap[ExposureTypeEnum.HI].name,
  },
];
