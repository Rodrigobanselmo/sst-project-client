const DROPPED_RELATION_KEYS = [
  'riskFactorData',
  'examToRisk',
  'docInfo',
  'protocolToRisk',
  'riskAddSession',
  'passBack',
] as const;

/**
 * Troca o editor pelo rascunho de duplicação ou cópia local.
 * O id do fator original não permanece, e vínculos não entram no estado.
 */
export function replaceRiskEditorWithDraft<T extends { id?: string }>(
  initial: T,
  draft: object,
): T {
  const fields = { ...(draft as Record<string, unknown>) };

  for (const key of DROPPED_RELATION_KEYS) {
    delete fields[key];
  }

  return {
    ...initial,
    ...fields,
    id: typeof fields.id === 'string' ? fields.id : '',
    recMed: [],
    generateSource: [],
  } as T;
}
