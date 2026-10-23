export type PfroRisk = {
  riskGroup: { id?: string; name?: string };
  riskSubgroup?: { id?: string; name: string } | null;
};

export const ergonomicSubgroup = (risk: PfroRisk) =>
  risk.riskGroup.id === 'ERG' && risk.riskSubgroup?.id?.trim() && risk.riskSubgroup.name?.trim()
    ? { id: risk.riskSubgroup.id, name: risk.riskSubgroup.name.trim() }
    : null;

export const pfroLabel = (risk: PfroRisk) => {
  const subgroup = ergonomicSubgroup(risk);
  return subgroup ? `ERG – ${subgroup.name}` : risk.riskGroup.id;
};

export const matchesPfro = (risk: PfroRisk, filter: string) => {
  if (!filter) return true;
  if (filter.startsWith('ERG:')) return ergonomicSubgroup(risk)?.id === filter.slice(4);
  return risk.riskGroup.id === filter;
};

export const ergonomicFilterOptions = (risks: PfroRisk[]) =>
  [...new Map(risks.flatMap(risk => {
    const subgroup = ergonomicSubgroup(risk);
    return subgroup ? [[subgroup.id, subgroup] as const] : [];
  })).values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
