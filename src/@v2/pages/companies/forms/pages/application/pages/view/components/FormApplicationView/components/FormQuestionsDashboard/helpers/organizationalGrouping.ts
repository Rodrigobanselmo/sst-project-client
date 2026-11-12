import { resolveFormHierarchyTypeLabel } from '@v2/models/form/helpers/form-hierarchy-type-presentation.util';
import type { FormParticipantStructureBrowseModel } from '@v2/models/form/models/form-questions-answers/form-participant-structure-browse.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

export const ORGANIZATIONAL_GROUPING_ID = '__participant_organization';
export const ORGANIZATIONAL_GROUPING_LABEL = 'Estrutura organizacional';

const hierarchyOrder = Object.values(HierarchyTypeEnum);

export function organizationalPath(
  structure: Pick<FormParticipantStructureBrowseModel, 'workspaceId' | 'workspaceName' | 'hierarchies'>,
  companyLabels?: unknown,
) {
  const workspace = {
    key: `workspace:${structure.workspaceId ?? ''}`,
    title: structure.workspaceName?.trim() || 'Sem estabelecimento',
    typeLabel: 'Estabelecimento',
  };

  return [
    workspace,
    ...structure.hierarchies
      .filter((node) => node.id && node.name?.trim())
      .sort((a, b) => hierarchyOrder.indexOf(a.type) - hierarchyOrder.indexOf(b.type))
      .map((node) => ({
        key: `${node.type}:${node.id}`,
        title: node.name.trim(),
        typeLabel: resolveFormHierarchyTypeLabel(node.type, companyLabels),
      })),
  ];
}

export function organizationalPathIds(path: ReturnType<typeof organizationalPath>) {
  let id = ORGANIZATIONAL_GROUPING_ID;
  return path.map(({ key }) => (id += '/' + encodeURIComponent(key)));
}

export function isOrganizationalDescendant(id: string, parentId: string) {
  return id.startsWith(parentId + '/');
}

export type OrganizationalGroup = {
  id: string;
  name: string;
  title: string;
  typeLabel: string;
  parentId: string | null;
  participantIds: Set<string>;
};

export function buildOrganizationalGroups(
  structures: FormParticipantStructureBrowseModel[],
  companyLabels?: unknown,
): OrganizationalGroup[] {
  const groups = new Map<string, OrganizationalGroup>();
  for (const structure of structures) {
    const path = organizationalPath(structure, companyLabels);
    const ids = organizationalPathIds(path);
    path.forEach(({ title, typeLabel }, index) => {
      const id = ids[index];
      const parentId = ids[index - 1] ?? null;
      let group = groups.get(id);
      if (!group) {
        const parent = parentId ? groups.get(parentId) : undefined;
        group = {
          id,
          name: parent ? `${parent.name} › ${title}` : title,
          title,
          typeLabel,
          parentId,
          participantIds: new Set(),
        };
        groups.set(id, group);
      }
      group.participantIds.add(structure.participantsAnswersId);
    });
  }
  return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
}
