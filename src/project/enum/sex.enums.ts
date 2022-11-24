export enum SexTypeEnum {
  M = 'M',
  F = 'F',
}

export interface ISexTypeOptions {
  type: SexTypeEnum;
  name: string;
}
interface ISexTypes extends Record<SexTypeEnum, ISexTypeOptions> {}

export const sexTypeMap: ISexTypes = {
  [SexTypeEnum.M]: {
    type: SexTypeEnum.M,
    name: 'Masculino',
  },
  [SexTypeEnum.F]: {
    type: SexTypeEnum.F,
    name: 'Feminino',
  },
};
