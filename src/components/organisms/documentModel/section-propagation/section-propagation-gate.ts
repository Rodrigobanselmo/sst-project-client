/**
 * Heading types that can open the tree action. The *link unit* is still the
 * structural section (anchor heading + window), not a V2 visual area and not
 * an elementary node (paragraph/bullet/break).
 *
 * Auto-created groups on duplication only include H1/H2/H3. Apply/Gerenciar
 * still work for any selected heading, including H4, if the user chose it.
 */

import { itemLevelMap } from 'components/organisms/documentModel/DocumentModelContent/constants/item-types.map';

import { NodeDocumentModel } from '../DocumentModelTree/types/types';

export const DOCUMENT_MODEL_SECTION_PROPAGATION_DIRTY_MESSAGE =
  'Salve as alterações deste modelo antes de aplicá-las aos demais.';

export const DOCUMENT_MODEL_SECTION_PROPAGATION_HEADING_MESSAGE =
  'Selecione um título da árvore para aplicar esta seção em outros modelos.';

export const DOCUMENT_MODEL_SECTION_PROPAGATION_PERMISSION_MESSAGE =
  'Você não tem permissão para editar modelos de documento.';

export function isDocumentHeadingType(type?: string): boolean {
  return Boolean(type && itemLevelMap[type]);
}

export function isDocumentHeadingTreeNode(
  node: NodeDocumentModel | null | undefined,
): boolean {
  if (!node?.data || !('element' in node.data)) return false;
  return isDocumentHeadingType(node.data.type);
}

export function canOpenSectionPropagation(args: {
  hasModelId: boolean;
  isHeadingSelected: boolean;
  canEdit: boolean;
  isDirty: boolean;
  v2LocalDirty: boolean;
  saveBusy: boolean;
  contentSavePending: boolean;
}): { ok: boolean; reason: string | null } {
  if (!args.canEdit) {
    return { ok: false, reason: DOCUMENT_MODEL_SECTION_PROPAGATION_PERMISSION_MESSAGE };
  }
  if (!args.hasModelId) {
    return { ok: false, reason: DOCUMENT_MODEL_SECTION_PROPAGATION_HEADING_MESSAGE };
  }
  if (!args.isHeadingSelected) {
    return { ok: false, reason: DOCUMENT_MODEL_SECTION_PROPAGATION_HEADING_MESSAGE };
  }
  if (
    args.isDirty ||
    args.v2LocalDirty ||
    args.saveBusy ||
    args.contentSavePending
  ) {
    return { ok: false, reason: DOCUMENT_MODEL_SECTION_PROPAGATION_DIRTY_MESSAGE };
  }
  return { ok: true, reason: null };
}
