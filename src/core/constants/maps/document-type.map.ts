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
  [DocumentTypeEnum.LTCAT]: {
    value: DocumentTypeEnum.LTCAT,
    content: 'LTCAT',
  },
  [DocumentTypeEnum.PERICULOSIDADE]: {
    value: DocumentTypeEnum.PERICULOSIDADE,
    content: 'Periculosidade',
  },
  [DocumentTypeEnum.INSALUBRIDADE]: {
    value: DocumentTypeEnum.INSALUBRIDADE,
    content: 'Insalubridade',
  },
  [DocumentTypeEnum.OTHER]: {
    value: DocumentTypeEnum.OTHER,
    content: 'Outro',
  },
};

export const documentTypeList = [
  documentTypeMap[DocumentTypeEnum.PGR],
  documentTypeMap[DocumentTypeEnum.PCSMO],
  documentTypeMap[DocumentTypeEnum.LTCAT],
  documentTypeMap[DocumentTypeEnum.PERICULOSIDADE],
  documentTypeMap[DocumentTypeEnum.INSALUBRIDADE],
  documentTypeMap[DocumentTypeEnum.OTHER],
];
