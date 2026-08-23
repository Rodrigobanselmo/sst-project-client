export const DOCUMENT_MODEL_CONFLICT = 'DOCUMENT_MODEL_CONFLICT';

export const DOCUMENT_MODEL_CONFLICT_TITLE = 'Modelo alterado';

export const DOCUMENT_MODEL_CONFLICT_MESSAGE =
  'Este modelo foi alterado e salvo em outra sessão depois que você o abriu.\n\nAs alterações feitas nesta tela não foram salvas nem apagadas.';

export const DOCUMENT_MODEL_CONFLICT_PRIMARY_HINT =
  'Recomendado: carregue a versão mais recente antes de continuar trabalhando. Isso evita que você faça novas alterações sobre uma versão desatualizada.';

export const DOCUMENT_MODEL_CONFLICT_PRIMARY_ACTION =
  'Carregar versão mais recente';

export const DOCUMENT_MODEL_CONFLICT_SECONDARY_HINT =
  'Precisa copiar algo desta versão antes?\n\nSe você fez alterações nesta tela e deseja aproveitar algum texto, mantenha esta versão aberta temporariamente para copiar o conteúdo desejado. Depois, carregue a versão mais recente antes de continuar o trabalho.';

export const DOCUMENT_MODEL_CONFLICT_SECONDARY_ACTION =
  'Manter esta versão aberta para copiar';

export function toOpaqueDocumentModelUpdatedAt(
  value: unknown,
): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
}

export function isDocumentModelConflict(error: unknown): boolean {
  const response = (error as { response?: { status?: number; data?: any } })
    ?.response;
  if (response?.status !== 409) return false;
  return response.data?.code === DOCUMENT_MODEL_CONFLICT;
}

export type DocumentModelLockClientState = {
  token: string | null;
  dirty: boolean;
  localDocument: unknown;
  cacheDocument: unknown;
  cacheUpdatedAt: string | null;
  v2Persisted: boolean;
};

export type DocumentModelLockPatchResult =
  | { status: 200; id: number; updated_at: string; data: unknown }
  | { status: 409; code: typeof DOCUMENT_MODEL_CONFLICT };

export function applyDocumentModelLockPatch(args: {
  backend: { updated_at: string; data: unknown };
  expectedUpdatedAt?: string;
  data?: unknown;
  nextUpdatedAt: string;
}): { backend: { updated_at: string; data: unknown }; result: DocumentModelLockPatchResult } {
  const { backend, expectedUpdatedAt, data, nextUpdatedAt } = args;

  if (data !== undefined && expectedUpdatedAt) {
    if (expectedUpdatedAt !== backend.updated_at) {
      return {
        backend,
        result: { status: 409, code: DOCUMENT_MODEL_CONFLICT },
      };
    }
    const next = { updated_at: nextUpdatedAt, data };
    return {
      backend: next,
      result: { status: 200, id: 13, updated_at: nextUpdatedAt, data },
    };
  }

  const next = {
    updated_at: nextUpdatedAt,
    data: data !== undefined ? data : backend.data,
  };
  return {
    backend: next,
    result: { status: 200, id: 13, updated_at: nextUpdatedAt, data: next.data },
  };
}

export function applySuccessfulClientPersist(
  state: DocumentModelLockClientState,
  result: Extract<DocumentModelLockPatchResult, { status: 200 }>,
): DocumentModelLockClientState {
  return {
    token: result.updated_at,
    dirty: false,
    localDocument: result.data,
    cacheDocument: result.data,
    cacheUpdatedAt: result.updated_at,
    v2Persisted: true,
  };
}

export function applyConflictClientPersist(
  state: DocumentModelLockClientState,
): DocumentModelLockClientState {
  return {
    ...state,
    dirty: true,
    v2Persisted: false,
  };
}

export function applyContinueEditing(
  state: DocumentModelLockClientState,
): DocumentModelLockClientState {
  return { ...state };
}

export function applyReloadOfficialDocument(
  official: { updated_at: string; data: unknown },
): DocumentModelLockClientState {
  return {
    token: official.updated_at,
    dirty: false,
    localDocument: official.data,
    cacheDocument: official.data,
    cacheUpdatedAt: official.updated_at,
    v2Persisted: true,
  };
}

export function getExpectedUpdatedAtFromDocumentState(document: {
  documentModelUpdatedAt?: string | null;
}): string | undefined {
  const token = document.documentModelUpdatedAt;
  return typeof token === 'string' && token.trim() ? token : undefined;
}

export function rehydrateDocumentModelUpdatedAt(value: unknown): string | null {
  return toOpaqueDocumentModelUpdatedAt(value);
}
