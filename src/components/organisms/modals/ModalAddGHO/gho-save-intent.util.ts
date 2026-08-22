import deepEqual from 'deep-equal';

import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';

export type GhoSaveIntent = 'stay' | 'exit';

export type GhoEditorSnapshotSource = {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  workspaceIds?: string[];
  workspaceIdsTouched?: boolean;
};

export function getGhoEditorSnapshot(
  ghoData: GhoEditorSnapshotSource,
  form: { name?: string; description?: string } = {},
) {
  return {
    id: ghoData.id || '',
    name: form.name ?? ghoData.name ?? '',
    description: form.description ?? ghoData.description ?? '',
    status: ghoData.status || '',
    workspaceIds: [...(ghoData.workspaceIds || [])].filter(Boolean).sort(),
    workspaceIdsTouched: !!ghoData.workspaceIdsTouched,
  };
}

export function isGhoEditorDirty(current: unknown, baseline: unknown): boolean {
  return !deepEqual(
    cleanObjectValues((current || {}) as object),
    cleanObjectValues((baseline || {}) as object),
  );
}

export function resolveGhoSaveIntent(params: {
  layout: 'modal' | 'page';
  requestedIntent?: GhoSaveIntent | null;
}): GhoSaveIntent {
  if (params.layout !== 'page') return 'exit';
  return params.requestedIntent === 'stay' ? 'stay' : 'exit';
}

export function shouldStayAfterGhoSave(params: {
  intent: GhoSaveIntent;
  savedId?: string | null;
}): boolean {
  return params.intent === 'stay' && !!params.savedId;
}

export function buildGhoStaySnapshot<
  T extends {
    id: string;
    name: string;
    description: string;
    workspaceIds?: string[];
    workspaceIdsTouched?: boolean;
  },
>(params: {
  current: T;
  form: { name: string; description: string };
  savedId: string;
  workspaceIds?: string[];
}): T {
  return {
    ...params.current,
    name: params.form.name,
    description: params.form.description,
    id: params.savedId,
    ...(params.workspaceIds
      ? {
          workspaceIds: params.workspaceIds,
          workspaceIdsTouched: false,
        }
      : {}),
  };
}
