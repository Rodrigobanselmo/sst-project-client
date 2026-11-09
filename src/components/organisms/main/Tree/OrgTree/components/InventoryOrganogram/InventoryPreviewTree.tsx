import { Box, ButtonBase, Typography } from '@mui/material';
import type { InventoryVisualReview } from '@v2/pages/companies/exposure-group-assistant/components/InventoryPgrImportReviewForm';
import { OrgTree } from '../../OrgTree.styles';
import { ChildrenComponent } from '../RenderChildren/styles';
import { HIERARCHY_CARD_RADIUS } from '../RenderCard/styles';
import { OrgTreeNode } from '../RenderNode/styles';

type Context = Parameters<InventoryVisualReview>[0];

type PreviewNode = {
  id: string;
  name: string;
  type: string;
  action?: 'create' | 'reuse' | 'blocked';
  decisionKey?: string;
  children: PreviewNode[];
};

const compareNames = new Intl.Collator('pt-BR', {
  sensitivity: 'base',
  numeric: true,
});

const labels: Record<string, string> = {
  WORKSPACE: 'Estabelecimento',
  DIRECTORY: 'Diretoria',
  MANAGEMENT: 'Gerência',
  SECTOR: 'Setor',
  SUB_SECTOR: 'Subsetor',
  ROLE: 'Cargo',
  PENDING: 'Revisão',
};

export function buildInventoryPreviewTree(
  review: Context['review'],
  step: Context['step'],
  workspaceName: string,
): PreviewNode {
  const root: PreviewNode = {
    id: 'workspace',
    name: workspaceName,
    type: 'WORKSPACE',
    children: [],
  };
  if (!review) return root;

  const catalog = new Map(
    review.eligibleParents.map((item) => [item.id, item]),
  );
  const existingNodes = new Map<string, PreviewNode>();
  const proposedNodes = new Map<string, PreviewNode>();
  const createdByNameAndType = new Map<string, PreviewNode>();
  const reusedRoles: PreviewNode = {
    id: 'reused-roles',
    name: 'Cargos existentes sem posição na prévia',
    type: 'PENDING',
    children: [],
  };
  const pending: PreviewNode = {
    id: 'pending',
    name: 'Destino a definir',
    type: 'PENDING',
    children: [],
  };

  const addExisting = (
    id: string | null,
    ancestors = new Set<string>(),
  ): PreviewNode => {
    const item = id ? catalog.get(id) : undefined;
    if (!item || ancestors.has(item.id)) return root;
    const existing = existingNodes.get(item.id);
    if (existing) return existing;

    ancestors.add(item.id);
    const parent = addExisting(item.parentId, ancestors);
    const node: PreviewNode = {
      id: `existing-${item.id}`,
      name: item.name,
      type: item.type,
      action: 'reuse',
      children: [],
    };
    existingNodes.set(item.id, node);
    parent.children.push(node);
    return node;
  };

  for (const structure of review.structures) {
    if (!structure.included || structure.planAction === 'skip') continue;
    const key = structure.splitFromKey || structure.key;
    const existingId = structure.selectedReuseParentHierarchyId;
    if (
      structure.planAction === 'reuse' &&
      existingId &&
      catalog.has(existingId)
    ) {
      const node = addExisting(existingId);
      node.decisionKey ??= key;
      proposedNodes.set(structure.key, node);
      continue;
    }
    const action = structure.planAction === 'create' ? 'create' : 'blocked';
    const creationKey = JSON.stringify([
      structure.appliedType,
      structure.appliedName,
    ]);
    const sameCreation =
      action === 'create' ? createdByNameAndType.get(creationKey) : undefined;
    if (sameCreation) {
      proposedNodes.set(structure.key, sameCreation);
      continue;
    }
    const node: PreviewNode = {
      id: `proposal-${structure.key}`,
      name: structure.appliedName || structure.proposedName,
      type: structure.appliedType,
      action,
      decisionKey: key,
      children: [],
    };
    proposedNodes.set(structure.key, node);
    if (action === 'create') {
      createdByNameAndType.set(creationKey, node);
      root.children.push(node);
    } else {
      pending.children.push(node);
    }
  }

  if (step === 'roles') {
    for (const role of review.roles) {
      if (!role.included || role.planAction === 'skip') continue;
      const action =
        role.planAction === 'create' || role.planAction === 'reuse'
          ? role.planAction
          : 'blocked';
      let parent = pending;
      if (action === 'reuse') {
        parent = reusedRoles;
      } else if (action === 'create') {
        parent =
          role.selectedParentHierarchyId &&
          catalog.has(role.selectedParentHierarchyId)
            ? addExisting(role.selectedParentHierarchyId)
            : (proposedNodes.get(role.selectedProposedStructureKey ?? '') ??
              pending);
      }
      parent.children.push({
        id: `role-${role.key}`,
        name: role.appliedName || role.sourceName,
        type: 'ROLE',
        action,
        decisionKey: role.key,
        children: [],
      });
    }
  }

  // Keep review-only branches after the actual and proposed structures.
  function sortBranches(node: PreviewNode) {
    node.children.sort((left, right) =>
      compareNames.compare(left.name, right.name),
    );
    node.children.forEach(sortBranches);
  }
  sortBranches(root);
  if (reusedRoles.children.length) {
    sortBranches(reusedRoles);
    root.children.push(reusedRoles);
  }
  if (pending.children.length) {
    sortBranches(pending);
    root.children.push(pending);
  }
  return root;
}

function PreviewBranch({
  node,
  context,
  root = false,
}: {
  node: PreviewNode;
  context: Context;
  root?: boolean;
}) {
  const { decisionKey } = node;
  const onClick = decisionKey
    ? () =>
        node.type === 'ROLE'
          ? context.onSelectRole(decisionKey)
          : context.onSelectStructure(decisionKey)
    : undefined;
  const badge =
    node.action === 'create'
      ? 'Proposto'
      : node.action === 'reuse'
        ? 'Existente'
        : node.action === 'blocked'
          ? 'Revisar'
          : '';
  const color =
    node.action === 'blocked'
      ? 'warning.dark'
      : node.type === 'ROLE'
        ? 'warning.main'
        : node.type === 'WORKSPACE'
          ? 'info.dark'
          : 'success.dark';

  return (
    <OrgTreeNode
      horizontal={1}
      expanded={Number(Boolean(node.children.length))}
      className={`org-tree-node${root ? ' org-tree-node-first' : ''}${node.children.length ? '' : ' is-leaf'}`}
    >
      <Box sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
        <Box
          component={onClick ? ButtonBase : 'div'}
          onClick={onClick}
          sx={{
            display: 'block',
            width: 230,
            textAlign: 'left',
            p: 4,
            bgcolor: 'background.paper',
            border: '2px solid',
            borderRadius: HIERARCHY_CARD_RADIUS,
            borderColor: color,
            borderStyle: node.action === 'create' ? 'dashed' : 'solid',
            '&.Mui-focusVisible': { outline: '2px solid', outlineOffset: 2 },
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {labels[node.type] || node.type}
            {badge ? ` · ${badge}` : ''}
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {node.name}
          </Typography>
        </Box>
      </Box>
      {node.children.length > 0 && (
        <ChildrenComponent horizontal={1} className="org-tree-node-children">
          {node.children.map((child) => (
            <PreviewBranch key={child.id} node={child} context={context} />
          ))}
        </ChildrenComponent>
      )}
    </OrgTreeNode>
  );
}

export function InventoryPreviewTree({
  workspaceName,
  ...context
}: Context & { workspaceName: string }) {
  const tree = buildInventoryPreviewTree(
    context.review,
    context.step,
    workspaceName,
  );
  return (
    <Box component="section" aria-label="Prévia visual do Inventário / PGR">
      <Typography variant="subtitle2" sx={{ mb: 3 }} role="status">
        {context.updating
          ? 'Aguardando a revisão atualizada do plano…'
          : 'Prévia do Inventário / PGR · nenhuma alteração gravada'}
      </Typography>
      {context.review && (
        <OrgTree horizontal>
          <PreviewBranch node={tree} context={context} root />
        </OrgTree>
      )}
    </Box>
  );
}
