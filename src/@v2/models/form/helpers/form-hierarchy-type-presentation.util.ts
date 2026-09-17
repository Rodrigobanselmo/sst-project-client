import type { CombinedHierarchyLevelKind } from '@v2/models/form/helpers/form-participants-aggregate-by-combined-hierarchy';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { resolveHierarchyTypeLabel } from 'core/constants/maps/hierarchy-type-labels';

export function resolveFormHierarchyTypeLabel(
  type: HierarchyTypeEnum,
  companyLabels?: unknown,
): string {
  return resolveHierarchyTypeLabel(type, companyLabels);
}

export function toFormHierarchySelectPart(label: string): string {
  return label.toLocaleLowerCase('pt-BR');
}

export function formatAgrupadoPor(parts: string[]): string {
  return `Agrupado por ${parts.map(toFormHierarchySelectPart).join(' + ')}`;
}

export function formatAgrupadoPorEstabelecimentoE(label: string): string {
  return `Agrupado por estabelecimento e ${toFormHierarchySelectPart(label)}`;
}

export function resolveCombinedLevelLabel(
  kind: CombinedHierarchyLevelKind,
  companyLabels?: unknown,
): string {
  if (kind === 'ESTABLISHMENT') return 'Estabelecimento';
  return resolveFormHierarchyTypeLabel(kind, companyLabels);
}

export function resolveCombinedHierarchySelectLabel(
  kinds: CombinedHierarchyLevelKind[],
  companyLabels?: unknown,
): string {
  return formatAgrupadoPor(
    kinds.map((kind) => resolveCombinedLevelLabel(kind, companyLabels)),
  );
}

export function resolveCombinedHierarchyColumnLabel(
  kinds: CombinedHierarchyLevelKind[],
  companyLabels?: unknown,
): string {
  return kinds
    .map((kind) => resolveCombinedLevelLabel(kind, companyLabels))
    .join(' / ');
}

export function formatPorSectionTitle(parts: string[]): string {
  return `Por ${parts.map(toFormHierarchySelectPart).join(' e ')}`;
}

export function resolveCombinedHierarchySectionTitle(
  kinds: CombinedHierarchyLevelKind[],
  companyLabels?: unknown,
): string {
  return formatPorSectionTitle(
    kinds.map((kind) => resolveCombinedLevelLabel(kind, companyLabels)),
  );
}

export function resolveMissingHierarchyTypeLabel(
  type: HierarchyTypeEnum,
  companyLabels?: unknown,
): string {
  return `Sem ${toFormHierarchySelectPart(
    resolveFormHierarchyTypeLabel(type, companyLabels),
  )}`;
}
