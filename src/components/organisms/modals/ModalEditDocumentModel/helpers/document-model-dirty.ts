import {
  DocumentModelClassificationEnum,
  normalizeDocumentModelClassifications,
} from 'project/enum/document-model-classification.enum';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

export type DocumentModelDirtySource = {
  name?: string | null;
  description?: string | null;
  type?: DocumentTypeEnum | null;
  status?: StatusEnum | null;
  classifications?: DocumentModelClassificationEnum[] | null;
  copyFromId?: number | null;
};

export type DocumentModelDirtySnapshot = {
  name: string;
  description: string;
  type: DocumentTypeEnum | null;
  status: StatusEnum | null;
  classifications: DocumentModelClassificationEnum[];
  copyFromId: number | null;
};

export const DOCUMENT_MODEL_DISCARD_MODAL = {
  title: 'Descartar alterações?',
  text: 'Existem alterações não salvas. Deseja descartá-las e sair?',
  confirmText: 'Descartar e sair',
  confirmCancel: 'Cancelar',
  tag: 'warning' as const,
};

export const getDocumentModelDirtySnapshot = (
  source: DocumentModelDirtySource,
): DocumentModelDirtySnapshot => ({
  name: source.name ?? '',
  description: source.description ?? '',
  type: source.type ?? null,
  status: source.status ?? null,
  classifications: [
    ...normalizeDocumentModelClassifications(source.classifications),
  ].sort(),
  copyFromId: source.copyFromId ?? null,
});

export const serializeDocumentModelDirtySnapshot = (
  snapshot: DocumentModelDirtySnapshot,
): string => JSON.stringify(snapshot);

export const mergeDocumentModelDirtySnapshot = (
  baseline: DocumentModelDirtySnapshot | null,
  partial: Partial<DocumentModelDirtySource>,
): DocumentModelDirtySnapshot =>
  getDocumentModelDirtySnapshot({
    ...(baseline ?? {}),
    ...partial,
  });

export const isDocumentModelEditorDirty = ({
  current,
  baseline,
  documentDirty,
}: {
  current: DocumentModelDirtySnapshot;
  baseline: DocumentModelDirtySnapshot | null;
  documentDirty: boolean;
}): boolean => {
  if (documentDirty) return true;
  if (!baseline) return false;
  return (
    serializeDocumentModelDirtySnapshot(current) !==
    serializeDocumentModelDirtySnapshot(baseline)
  );
};
