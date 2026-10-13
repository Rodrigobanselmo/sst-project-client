export type DerivedControlLink = {
  derivedRecMedId?: string | null;
  workspaceId?: string | null;
};

/**
 * Mesma regra da API: sem derivação, o controle segue compartilhado;
 * com derivação, só vale nos estabelecimentos registrados; sem estabelecimento,
 * a derivada não é controle implementado. Comparação por id.
 */
export function filterImplementedControls<T>(params: {
  controls: Array<T | null | undefined> | null | undefined;
  getId: (control: T) => string | null | undefined;
  derivedLinks: Array<DerivedControlLink | null | undefined> | null | undefined;
  workspaceId?: string | null;
}): T[] {
  const workspacesByControl = new Map<string, Set<string>>();
  for (const link of params.derivedLinks ?? []) {
    if (!link?.derivedRecMedId || !link.workspaceId) continue;
    const workspaces = workspacesByControl.get(link.derivedRecMedId) ?? new Set<string>();
    workspaces.add(link.workspaceId);
    workspacesByControl.set(link.derivedRecMedId, workspaces);
  }

  return (params.controls ?? []).filter((control): control is T => {
    if (control == null) return false;
    const controlId = params.getId(control);
    if (!controlId) return true;
    const workspaces = workspacesByControl.get(controlId);
    if (!workspaces?.size) return true;
    if (!params.workspaceId) return false;
    return workspaces.has(params.workspaceId);
  });
}

/** Ids que o salvamento deve continuar enviando: a associação completa do fator. */
export function persistedControlIds<T extends { id?: string | null }>(
  controls: Array<T | null | undefined> | null | undefined,
  removedIds: string[] = [],
): string[] {
  return (controls ?? [])
    .filter((control): control is T => !!control?.id && !removedIds.includes(control.id))
    .map((control) => control.id as string);
}
