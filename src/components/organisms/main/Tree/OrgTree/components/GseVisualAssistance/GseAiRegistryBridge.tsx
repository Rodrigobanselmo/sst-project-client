import React from 'react';
import { GseAiConsultativeAnalysis } from './GseAiConsultativeAnalysis';
import { useGseVisualAssistance } from './GseVisualAssistance.context';
import { registrySignature } from './gse-consultative-interaction';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { setSelectItem } from 'store/reducers/hierarchy/hierarchySlice';
import { useModal } from 'core/hooks/useModal';
import { ModalEnum } from 'core/enums/modal.enums';

/** Opens the existing editor without closing/rekeying the consultative session. */
export function GseAiRegistryBridge(props: React.ComponentProps<typeof GseAiConsultativeAnalysis>) {
  const ctx = useGseVisualAssistance();
  const registry = useQueryHierarchies(props.companyId);
  const { isAuthSuccess } = useAuthShow();
  const dispatch = useAppDispatch(); const { onOpenModal } = useModal();
  const canEdit = isAuthSuccess({ permissions: [PermissionEnum.EMPLOYEE], cruds: 'u' });
  const nodeFor = (id: string) => {
    const h = registry.data[id];
    if (!ctx || !h || h.companyId !== props.companyId || !h.workspaceIds?.includes(props.workspaceId) || !['OFFICE','SUB_OFFICE'].includes(h.type)) return undefined;
    const node = ctx.nodes[`${id}//${props.workspaceId}`];
    if (!node || node.showRef || String(node.type) !== String(h.type)) return undefined;
    if (h.parentId && String(node.parentId || '').split('//')[0] !== h.parentId) return undefined;
    return node;
  };
  return <GseAiConsultativeAnalysis {...props}
    registrySignature={registrySignature(registry.data, ctx?.groups || [], props.companyId, props.workspaceId)}
    onRefreshRegistry={async () => { const result = await registry.refetch(); if (result.isError) throw Error('Não foi possível atualizar os dados cadastrais. Tente novamente antes de reanalisar.'); return registrySignature(result.data || {}, ctx?.groups || [], props.companyId, props.workspaceId); }}
    canEditRole={(id, field) => canEdit && !!nodeFor(id) && !(field === 'realDescription' && registry.data[id]?.type === 'SUB_OFFICE')}
    onEditRole={(id, field) => {
      const node = nodeFor(id); if (!canEdit || !node || (field === 'realDescription' && registry.data[id]?.type === 'SUB_OFFICE')) return;
      const h = registry.data[id];
      dispatch(setSelectItem({ ...node, label: h.name, description: h.description, realDescription: h.realDescription, action: 'edit' }));
      onOpenModal(ModalEnum.HIERARCHY_TREE_CARD, { gseFocusField: field });
    }} />;
}
