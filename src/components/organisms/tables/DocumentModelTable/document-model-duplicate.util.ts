import { DocumentModelClassificationEnum } from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { ICreateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutCreateDocumentModel/useMutCreateDocumentModel';

export const DOCUMENT_MODEL_DUPLICATE_SUCCESS_MESSAGE =
  'Modelo duplicado com sucesso';

export function buildDocumentModelDuplicateName(sourceName?: string | null) {
  const name = sourceName?.trim() || 'Modelo';
  return `${name} — Cópia`;
}

export function canSubmitDocumentModelDuplicate(name?: string | null) {
  return Boolean(name?.trim());
}

export function buildDocumentModelDuplicatePayload(args: {
  source: {
    id: number;
    companyId: string;
    name: string;
    description?: string | null;
    type: DocumentTypeEnum;
    classifications?: DocumentModelClassificationEnum[];
  };
  name: string;
}): ICreateDocumentModel {
  return {
    companyId: args.source.companyId,
    name: args.name.trim(),
    description: args.source.description || undefined,
    type: args.source.type,
    classifications: args.source.classifications,
    copyFromId: args.source.id,
  };
}
