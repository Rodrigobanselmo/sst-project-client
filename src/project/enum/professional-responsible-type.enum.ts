export enum ProfessionalRespTypeEnum {
  AMB = 'AMB',
  BIO = 'BIO',
}

export const profRespMap: Record<
  ProfessionalRespTypeEnum,
  {
    value: ProfessionalRespTypeEnum;
    content: string;
  }
> = {
  [ProfessionalRespTypeEnum.AMB]: {
    value: ProfessionalRespTypeEnum.AMB,
    content: 'Ambiental',
  },
  [ProfessionalRespTypeEnum.BIO]: {
    value: ProfessionalRespTypeEnum.BIO,
    content: 'Biológico',
  },
};

export const profRespTypeList = [
  profRespMap[ProfessionalRespTypeEnum.AMB],
  profRespMap[ProfessionalRespTypeEnum.BIO],
];
