import { DocumentTypeEnum } from 'project/enum/document.enums';

export interface IDocumentTypeOption {
  value: DocumentTypeEnum;
  name: string;
}
interface IDocumentTypeOptions
  extends Record<DocumentTypeEnum, IDocumentTypeOption> {}

export const documentTypeMap: IDocumentTypeOptions = {
  [DocumentTypeEnum.PGR]: {
    value: DocumentTypeEnum.PGR,
    name: 'PGR',
  },
  [DocumentTypeEnum.PCSMO]: {
    value: DocumentTypeEnum.PCSMO,
    name: 'PCMSO',
  },
  [DocumentTypeEnum.OTHER]: {
    value: DocumentTypeEnum.OTHER,
    name: 'Outro',
  },
};
