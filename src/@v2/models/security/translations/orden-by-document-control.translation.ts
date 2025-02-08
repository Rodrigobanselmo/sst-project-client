import { DocumentControlOrderByEnum } from '@v2/services/enterprise/document-control/document-control/browse-document-control/service/browse-document-control.types';

type OrderByTranslationMap = Record<DocumentControlOrderByEnum, string>;

export const ordenByDocumentControlTranslation: OrderByTranslationMap = {
  [DocumentControlOrderByEnum.CREATED_AT]: 'data de criação',
  [DocumentControlOrderByEnum.UPDATED_AT]: 'data de atualização',
  [DocumentControlOrderByEnum.DESCRIPTION]: 'descrição',
  [DocumentControlOrderByEnum.NAME]: 'nome',
  [DocumentControlOrderByEnum.END_DATE]: 'data de término',
  [DocumentControlOrderByEnum.START_DATE]: 'data de início',
  [DocumentControlOrderByEnum.TYPE]: 'tipo',
};
