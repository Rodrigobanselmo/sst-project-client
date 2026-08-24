import { DOCUMENT_MODEL_EXTERNAL_SYNC_PENDING_MESSAGE } from 'components/organisms/documentModel/external-edit/document-editor-external-mutation';

export { DOCUMENT_MODEL_EXTERNAL_SYNC_PENDING_MESSAGE };

export type ExternalEditSyncResult = {
  ok: boolean;
  changed?: boolean;
};

type ExternalEditSyncFn = () => ExternalEditSyncResult;

let classicSync: ExternalEditSyncFn | null = null;
let v2Sync: ExternalEditSyncFn | null = null;

export function registerClassicExternalEditSync(
  sync: ExternalEditSyncFn,
): () => void {
  classicSync = sync;
  return () => {
    if (classicSync === sync) classicSync = null;
  };
}

export function registerV2ExternalEditSync(
  sync: ExternalEditSyncFn,
): () => void {
  v2Sync = sync;
  return () => {
    if (v2Sync === sync) v2Sync = null;
  };
}

export function hasClassicExternalEditSync(): boolean {
  return typeof classicSync === 'function';
}

export function hasV2ExternalEditSync(): boolean {
  return typeof v2Sync === 'function';
}

export function syncDocumentEditorExternalMutationsBeforeSave(): ExternalEditSyncResult {
  const classic = classicSync?.() ?? { ok: true };
  const v2 = v2Sync?.() ?? { ok: true };
  return {
    ok: classic.ok && v2.ok,
    changed: Boolean(classic.changed || v2.changed),
  };
}
