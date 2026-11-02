export type StructuralTable =
  | 'Hierarchy'
  | 'HomogeneousGroup'
  | 'CompanyCharacterization'
  | 'Workspace';
export type StructuralTarget = { table: StructuralTable; id: string };
export type StructuralAction =
  | 'ARCHIVE'
  | 'RESTORE'
  | 'METADATA'
  | 'RELATION_PERIODS';
export type StructuralPeriod = {
  effectiveFrom: string;
  effectiveTo?: string;
  revisionId?: string;
  values?: Record<string, unknown>;
};
export type StructuralRelation = {
  to: StructuralTarget;
  label: string;
  expectedRevisionId: string;
  periods: StructuralPeriod[];
  physicallyPresent: boolean;
};
export type StructuralContext = {
  target: StructuralTarget;
  label: string;
  archived: boolean;
  current: Record<string, unknown>;
  allowedFields: string[];
  periods: StructuralPeriod[];
  relations?: StructuralRelation[];
  selectedPeriod?: StructuralPeriod | null;
  expectedHead: string;
  impactHash: string;
  affectedEmployments?: number;
  affectedEmploymentIds: string[];
  affectedEmploymentIdsTruncated?: boolean;
  blockers: { code: string; message: string }[];
  effects: string[];
};
/** Newer APIs return an exact count and only a bounded sample of identities. */
export function structuralEmploymentCount(context: Pick<StructuralContext, 'affectedEmployments' | 'affectedEmploymentIds'>) {
  return context.affectedEmployments ?? context.affectedEmploymentIds.length;
}
export const structuralLabels: Record<StructuralAction, string> = {
  ARCHIVE: 'Encerrar cadastro',
  RESTORE: 'Restaurar cadastro',
  METADATA: 'Corrigir dados de um período',
  RELATION_PERIODS: 'Corrigir períodos de participação',
};
export const structuralFields: Record<
  string,
  { label: string; type?: 'list' | 'boolean' }
> = {
  name: { label: 'Nome' },
  description: { label: 'Descrição' },
  realDescription: { label: 'Atividades do cargo' },
  activities: { label: 'Atividades', type: 'list' },
  considerations: { label: 'Considerações', type: 'list' },
  paragraphs: { label: 'Descrição detalhada', type: 'list' },
  riskInventorySummary: { label: 'Resumo do inventário de riscos' },
  luminosity: { label: 'Iluminação' },
  moisturePercentage: { label: 'Umidade' },
  noiseValue: { label: 'Ruído' },
  temperature: { label: 'Temperatura' },
  cnpj: { label: 'CNPJ do estabelecimento' },
  isOwner: { label: 'Estabelecimento próprio?', type: 'boolean' },
};
const listText = (value: unknown) =>
  Array.isArray(value)
    ? value.map((line) => String(line).replace(/\{type\}=.+$/, '')).join('\n')
    : '';
export function structuralMetadataDraft(
  values: Record<string, unknown>,
  allowedFields: string[],
) {
  return Object.fromEntries(
    allowedFields
      .filter((field) => structuralFields[field])
      .map((field) => [
        field,
        structuralFields[field].type === 'list'
          ? listText(values[field])
          : values[field] == null
            ? ''
            : String(values[field]),
      ]),
  );
}
export function structuralMetadataPatch(
  values: Record<string, unknown>,
  draft: Record<string, string>,
  allowedFields: string[],
) {
  const baseline = structuralMetadataDraft(values, allowedFields);
  const patch: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (!(field in draft) || draft[field] === baseline[field]) continue;
    if (structuralFields[field]?.type === 'boolean') {
      if (!['true', 'false'].includes(draft[field]))
        throw new Error('Escolha se o estabelecimento é próprio.');
      patch[field] = draft[field] === 'true';
    } else if (structuralFields[field]?.type === 'list') {
      const previous = Array.isArray(values[field])
        ? (values[field] as string[])
        : [];
      patch[field] = draft[field]
        .split('\n')
        .filter((line) => line.trim())
        .map((line, index) => {
          const existing =
            previous.find(
              (item) => item.replace(/\{type\}=.+$/, '') === line,
            ) || previous[index];
          const marker = existing?.match(/\{type\}=.+$/)?.[0] || '';
          return line + marker;
        });
    } else
      patch[field] =
        field === 'cnpj' ? draft[field].replace(/\D/g, '') : draft[field];
  }
  if (!Object.keys(patch).length)
    throw new Error('Altere pelo menos um campo do período selecionado.');
  return patch;
}
export function structuralIntent(action: StructuralAction) {
  return action === 'ARCHIVE' || action === 'RESTORE'
    ? 'NEW_CONDITION'
    : 'CORRECTION';
}
export function requireStructuralPeriods(
  periods: StructuralPeriod[],
  physicallyPresent: boolean,
) {
  const civilDate = (value?: string) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00Z');
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  };
  const sorted = [...periods].sort((a, b) =>
    a.effectiveFrom.localeCompare(b.effectiveFrom),
  );
  for (let index = 0; index < sorted.length; index++) {
    const period = sorted[index],
      previous = sorted[index - 1];
    if (
      !civilDate(period.effectiveFrom) ||
      (period.effectiveTo &&
        (!civilDate(period.effectiveTo) ||
          period.effectiveTo <= period.effectiveFrom))
    )
      throw new Error('Confira as datas de início e fim de cada participação.');
    if (
      previous &&
      (!previous.effectiveTo || previous.effectiveTo > period.effectiveFrom)
    )
      throw new Error('Os períodos de participação não podem se sobrepor.');
  }
  if (
    sorted.filter((period) => !period.effectiveTo).length !==
    (physicallyPresent ? 1 : 0)
  )
    throw new Error(
      'A correção deve preservar a participação atual. Para entrar ou sair de um setor/estabelecimento, use a movimentação datada no cadastro.',
    );
  return sorted.map(({ effectiveFrom, effectiveTo }) => ({
    effectiveFrom,
    ...(effectiveTo ? { effectiveTo } : {}),
  }));
}
