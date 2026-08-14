export type GhoSaveIntent = 'stay' | 'exit';

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
