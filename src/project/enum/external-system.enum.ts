export enum ExternalSystemEnum {
  SIMPLE = 'SIMPLE',
  RS_DATA = 'RS_DATA',
}

export const externalSystemEnumMap: Record<
  ExternalSystemEnum,
  {
    value: ExternalSystemEnum;
    content: string;
  }
> = {
  [ExternalSystemEnum.SIMPLE]: {
    value: ExternalSystemEnum.SIMPLE,
    content: 'SimpleSST',
  },
  [ExternalSystemEnum.RS_DATA]: {
    value: ExternalSystemEnum.RS_DATA,
    content: 'RSData',
  },
};

export const externalSystemEnumList = [
  externalSystemEnumMap[ExternalSystemEnum.SIMPLE],
  externalSystemEnumMap[ExternalSystemEnum.RS_DATA],
];
