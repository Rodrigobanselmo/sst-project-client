import {
  DocumentModelClassificationEnum,
  documentModelMatchesClassificationFilters,
  normalizeDocumentModelClassifications,
} from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { IQueryDocumentModels } from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';

export function getSameTypeCopyQuery(args: {
  type?: DocumentTypeEnum;
  classifications?: DocumentModelClassificationEnum[] | null;
}): IQueryDocumentModels | undefined {
  if (!args.type) return undefined;

  const classifications = normalizeDocumentModelClassifications(
    args.classifications,
  );

  return {
    type: args.type,
    ...(classifications.length ? { classifications } : {}),
  };
}

export function shouldClearSameTypeCopyFrom(args: {
  copyFrom?: {
    type?: DocumentTypeEnum;
    classifications?: DocumentModelClassificationEnum[];
  } | null;
  documentType?: DocumentTypeEnum;
  selectedClassifications?: DocumentModelClassificationEnum[] | null;
}): boolean {
  if (!args.copyFrom) return false;
  if (!args.documentType || args.copyFrom.type !== args.documentType) {
    return false;
  }

  const selected = normalizeDocumentModelClassifications(
    args.selectedClassifications,
  );
  if (!selected.length) return false;

  return !documentModelMatchesClassificationFilters(
    args.copyFrom.classifications,
    selected,
  );
}
