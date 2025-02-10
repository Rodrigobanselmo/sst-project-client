export enum DocumentControlTypeEnum {
  PGR = 'PGR',
  PCSMO = 'PCSMO',
  OTHER = 'OTHER',
}

export interface IDocumentControlTypeOption {
  value: DocumentControlTypeEnum;
  content: string;
}
interface IDocumentTypeOptions
  extends Record<DocumentControlTypeEnum, IDocumentControlTypeOption> {}

export const documentControlTypeMap: IDocumentTypeOptions = {
  [DocumentControlTypeEnum.PGR]: {
    value: DocumentControlTypeEnum.PGR,
    content: 'PGR',
  },
  [DocumentControlTypeEnum.PCSMO]: {
    value: DocumentControlTypeEnum.PCSMO,
    content: 'PCMSO',
  },
  [DocumentControlTypeEnum.OTHER]: {
    value: DocumentControlTypeEnum.OTHER,
    content: 'Outro',
  },
};

export const documentControlTypeList = [
  documentControlTypeMap[DocumentControlTypeEnum.PGR],
  documentControlTypeMap[DocumentControlTypeEnum.PCSMO],
  documentControlTypeMap[DocumentControlTypeEnum.OTHER],
];
