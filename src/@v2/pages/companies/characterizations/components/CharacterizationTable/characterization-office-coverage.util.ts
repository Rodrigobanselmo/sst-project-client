import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IHierarchyMap } from 'core/interfaces/api/IHierarchy';
import {
  formatGseOfficeCountLines,
  GseCoverageNode,
  GseInheritedOfficeOrigin,
  resolveEffectiveOfficeCoverage,
} from 'core/utils/gse-effective-office-membership.util';

export type CharacterizationOfficeCoverageSummary = {
  effectiveOfficeCount: number;
  directOfficeCount: number;
  inheritedOfficeCount: number;
  inheritedOfficeOrigins: GseInheritedOfficeOrigin[];
};

export function hierarchyMapToCoverageNodes(
  hierarchyMap: IHierarchyMap | undefined,
): GseCoverageNode[] {
  return Object.values(hierarchyMap || {}).map((hierarchy) => ({
    id: hierarchy.id,
    parentId: hierarchy.parentId,
    type: hierarchy.type,
    name: hierarchy.name,
    workspaceIds: hierarchy.workspaceIds,
    companyId: hierarchy.companyId,
    deletedAt: (hierarchy as { deletedAt?: string | null }).deletedAt,
  }));
}

/**
 * A árvore da empresa inclui todos os estabelecimentos. Cargos de outro
 * estabelecimento saem antes do layout, para não caírem no grupo
 * "Sem estabelecimento" do builder compartilhado com o GSE.
 */
export function officesForSelectedEstablishment(
  nodes: GseCoverageNode[],
  workspaceId: string,
): GseCoverageNode[] {
  if (!workspaceId) return nodes;
  return nodes.filter((node) => {
    if (node.type !== HierarchyEnum.OFFICE) return true;
    return (node.workspaceIds || []).includes(workspaceId);
  });
}

export function summarizeEffectiveOfficeCoverage(params: {
  nodes: GseCoverageNode[];
  links: { hierarchyId: string }[];
  workspaceId?: string;
}): CharacterizationOfficeCoverageSummary {
  const offices = resolveEffectiveOfficeCoverage(params);
  const origins = new Map<string, GseInheritedOfficeOrigin>();
  let directOfficeCount = 0;
  let inheritedOfficeCount = 0;

  offices.forEach((office) => {
    if (office.origin === 'direct') {
      directOfficeCount += 1;
      return;
    }

    inheritedOfficeCount += 1;
    const current = origins.get(office.sourceHierarchyId);
    if (current) {
      current.count += 1;
      return;
    }

    origins.set(office.sourceHierarchyId, {
      sourceHierarchyId: office.sourceHierarchyId,
      sourceType: office.sourceType,
      sourceName: office.sourceName,
      count: 1,
    });
  });

  return {
    effectiveOfficeCount: offices.length,
    directOfficeCount,
    inheritedOfficeCount,
    inheritedOfficeOrigins: [...origins.values()],
  };
}

export function formatCharacterizationCargoTooltipLines(params: {
  summary: CharacterizationOfficeCoverageSummary;
  explicitHierarchies: { name: string; type: string }[];
  typeLabels?: Partial<Record<string, string>>;
}): string[] {
  const lines = formatGseOfficeCountLines({
    ...params.summary,
    typeLabels: params.typeLabels,
  });

  if (!params.explicitHierarchies.length) return lines;

  lines.push('Vínculos explícitos:');
  params.explicitHierarchies.forEach((hierarchy) => {
    const typeLabel =
      params.typeLabels?.[hierarchy.type] || hierarchy.type || 'Vínculo';
    lines.push(`(${typeLabel}) ${hierarchy.name}`);
  });

  return lines;
}
