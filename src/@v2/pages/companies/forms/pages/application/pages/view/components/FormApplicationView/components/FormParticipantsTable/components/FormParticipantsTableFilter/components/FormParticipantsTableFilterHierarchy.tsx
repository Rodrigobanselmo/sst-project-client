import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { resolveFormHierarchyTypeLabel } from '@v2/models/form/helpers/form-hierarchy-type-presentation.util';
import { useHierarchyTypeLabels } from 'core/hooks/useHierarchyTypeLabels';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { useMemo, useState } from 'react';
import { OrganizationalGroupingDialog } from '../../../../FormQuestionsDashboard/components/OrganizationalGroupingDialog';
import type { OrganizationalGroup } from '../../../../FormQuestionsDashboard/helpers/organizationalGrouping';

type HierarchyFilterValue = {
  id: string;
  name: string;
  type?: HierarchyTypeEnum;
};

interface FormParticipantsTableFilterHierarchyProps {
  companyId: string;
  allowedTypes: HierarchyTypeEnum[];
  workspaceIds: string[];
  value: HierarchyFilterValue[];
  onChange: (selected: HierarchyFilterValue[]) => void;
}

export function FormParticipantsTableFilterHierarchy({
  companyId,
  allowedTypes,
  workspaceIds,
  value,
  onChange,
}: FormParticipantsTableFilterHierarchyProps) {
  const typeLabels = useHierarchyTypeLabels();
  const [open, setOpen] = useState(false);
  const { data: tree, isLoading, isError, refetch } = useQueryHierarchies(companyId, { enabled: open });

  const { groups, valuesByPath, pathsById } = useMemo(() => {
    const groups: OrganizationalGroup[] = [];
    const valuesByPath = new Map<string, HierarchyFilterValue>();
    const pathsById = new Map<string, string>();
    const groupsById = new Map<string, OrganizationalGroup>();

    function addGroup(id: string): OrganizationalGroup | undefined {
      const existing = groupsById.get(id);
      if (existing) return existing;
      const node = tree[id];
      const type = node?.type as unknown as HierarchyTypeEnum;
      if (!node || !allowedTypes.includes(type)) return undefined;

      const parent = node.parentId ? addGroup(node.parentId) : undefined;
      const path = `${parent?.id ?? ''}/${encodeURIComponent(id)}`;
      const group = {
        id: path,
        name: parent ? `${parent.name} › ${node.name}` : node.name,
        title: node.name,
        typeLabel: resolveFormHierarchyTypeLabel(type, typeLabels),
        parentId: parent?.id ?? null,
        participantIds: new Set<string>(),
      };
      groupsById.set(id, group);
      groups.push(group);
      valuesByPath.set(path, { id, name: node.name, type });
      pathsById.set(id, path);
      return group;
    }

    for (const node of Object.values(tree)) {
      if (!workspaceIds.length || node.workspaceIds?.some((id) => workspaceIds.includes(id))) {
        addGroup(node.id);
      }
    }
    for (const item of value) addGroup(item.id);

    groups.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    return { groups, valuesByPath, pathsById };
  }, [tree, allowedTypes, workspaceIds, typeLabels, value]);

  const close = () => setOpen(false);

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {value.length ? `Selecionar hierarquias (${value.length})` : 'Selecionar hierarquias'}
      </Button>
      {open && (isLoading || isError ? (
        <Dialog open onClose={close}>
          <DialogContent>
            {isError ? 'Não foi possível carregar a estrutura organizacional.' : 'Carregando estrutura organizacional…'}
          </DialogContent>
          <DialogActions>
            <Button onClick={close}>Cancelar</Button>
            {isError && <Button onClick={() => refetch()}>Tentar novamente</Button>}
          </DialogActions>
        </Dialog>
      ) : (
        <OrganizationalGroupingDialog
          title="Selecionar setor / hierarquia"
          groups={groups}
          counts={null}
          showRespondents={false}
          selectedIds={value.flatMap(({ id }) => pathsById.get(id) ?? [])}
          onClose={close}
          onApply={(ids) => {
            onChange(ids.flatMap((id) => valuesByPath.get(id) ?? []));
            close();
          }}
        />
      ))}
    </>
  );
}
