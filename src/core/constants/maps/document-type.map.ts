import { DocumentTypeEnum } from 'project/enum/document.enums';

export interface IDocumentTypeOption {
  value: DocumentTypeEnum;
  content: string;
}
interface IDocumentTypeOptions
  extends Record<DocumentTypeEnum, IDocumentTypeOption> {}

export const documentTypeMap: IDocumentTypeOptions = {
  [DocumentTypeEnum.PGR]: {
    value: DocumentTypeEnum.PGR,
    content: 'PGR',
  },
  [DocumentTypeEnum.PCSMO]: {
    value: DocumentTypeEnum.PCSMO,
    content: 'PCMSO',
  },
  [DocumentTypeEnum.OTHER]: {
    value: DocumentTypeEnum.OTHER,
    content: 'Outro',
  },
};

export const documentTypeList = [
  documentTypeMap[DocumentTypeEnum.PGR],
  documentTypeMap[DocumentTypeEnum.PCSMO],
  documentTypeMap[DocumentTypeEnum.OTHER],
];
