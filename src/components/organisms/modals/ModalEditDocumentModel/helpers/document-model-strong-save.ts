import { toOpaqueDocumentModelUpdatedAt } from './document-model-optimistic-lock';

export const DOCUMENT_MODEL_HASH_MISMATCH = 'DOCUMENT_MODEL_HASH_MISMATCH';
export const DOCUMENT_MODEL_HASH_MISMATCH_MESSAGE =
  'A confirmação do conteúdo salvo não corresponde ao snapshot enviado.';
export const DOCUMENT_MODEL_INVALID_SAVE_RESPONSE =
  'Resposta inválida do servidor ao salvar o modelo.';
export const DOCUMENT_MODEL_SAVE_SUCCESS_MESSAGE = 'Modelo editado com sucesso';

export type DocumentModelSaveResponse = {
  id?: number;
  updated_at?: unknown;
  dataHash?: string;
} | null;

export type DocumentModelSaveConfirmation =
  | { ok: true; updatedAt: string; dataHash: string }
  | { ok: false; reason: 'invalid-response' | 'hash-mismatch' };

export function confirmDocumentModelSave(args: {
  clientHash: string;
  response: DocumentModelSaveResponse;
}): DocumentModelSaveConfirmation {
  const updatedAt = toOpaqueDocumentModelUpdatedAt(args.response?.updated_at);
  const dataHash = args.response?.dataHash;
  if (!args.response?.id || !updatedAt || !dataHash) {
    return { ok: false, reason: 'invalid-response' };
  }
  if (dataHash !== args.clientHash) {
    return { ok: false, reason: 'hash-mismatch' };
  }
  return { ok: true, updatedAt, dataHash };
}

export function shouldApplyOfficialDocumentRebase(args: {
  documentDirty: boolean;
  v2LocalDirty: boolean;
  contentSavePending?: boolean;
  confirmedUpdatedAt?: string | null;
  incomingUpdatedAt?: string | null;
}): boolean {
  if (args.documentDirty || args.v2LocalDirty || args.contentSavePending) {
    return false;
  }

  if (args.confirmedUpdatedAt && args.incomingUpdatedAt) {
    const incoming = Date.parse(args.incomingUpdatedAt);
    const confirmed = Date.parse(args.confirmedUpdatedAt);
    if (
      !Number.isNaN(incoming) &&
      !Number.isNaN(confirmed) &&
      incoming < confirmed
    ) {
      return false;
    }
  }

  return true;
}

export function resolveDirtyAfterSaveAttempt(args: {
  confirmed: boolean;
  localChangedAfterSnapshot?: boolean;
}): boolean {
  if (!args.confirmed) return true;
  return Boolean(args.localChangedAfterSnapshot);
}
