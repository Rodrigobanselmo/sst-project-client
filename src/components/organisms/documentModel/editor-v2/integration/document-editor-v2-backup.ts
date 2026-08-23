import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

export const DOCUMENT_EDITOR_V2_BACKUP_PREFIX = 'document-editor-v2-backup';

export type DocumentEditorV2BackupRecord = {
  createdAt: string;
  companyId: string;
  modelId: string;
  document: IDocumentModelData;
};

export type DocumentEditorV2BackupStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function documentEditorV2BackupKey(
  companyId: string,
  modelId: number | string,
): string {
  return `${DOCUMENT_EDITOR_V2_BACKUP_PREFIX}:${companyId}:${modelId}`;
}

export function rememberCanonicalBackup(
  storage: DocumentEditorV2BackupStorage,
  args: {
    companyId: string;
    modelId: number | string;
    original: IDocumentModelData;
    now?: string;
  },
): boolean {
  const key = documentEditorV2BackupKey(args.companyId, args.modelId);
  if (storage.getItem(key)) return false;

  const record: DocumentEditorV2BackupRecord = {
    createdAt: args.now || new Date().toISOString(),
    companyId: args.companyId,
    modelId: String(args.modelId),
    document: args.original,
  };
  storage.setItem(key, JSON.stringify(record));
  return true;
}

export function readCanonicalBackup(
  storage: DocumentEditorV2BackupStorage,
  companyId: string,
  modelId: number | string,
): DocumentEditorV2BackupRecord | null {
  const raw = storage.getItem(documentEditorV2BackupKey(companyId, modelId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DocumentEditorV2BackupRecord;
  } catch {
    return null;
  }
}
