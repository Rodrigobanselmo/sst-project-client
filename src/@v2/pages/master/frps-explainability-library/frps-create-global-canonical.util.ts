import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

export const FRPS_CREATE_GLOBAL_ACTION_LABEL = 'Criar canônico global';

export const FRPS_CREATE_GLOBAL_CONFIRM_LABEL = 'Criar e vincular';

export const FRPS_CREATE_GLOBAL_SUCCESS_MESSAGE =
  'Canônico global criado e itens vinculados com sucesso.';

export const FRPS_CREATE_GLOBAL_TITLE = 'Criar canônico global';

export const FRPS_CREATE_GLOBAL_BODY =
  'Será criado um novo item no catálogo oficial SimpleSST a partir do item local selecionado. Os itens locais originais serão preservados e vinculados ao novo canônico.';

export const FRPS_CREATE_GLOBAL_NO_EXPLANATION_WARNING =
  'O novo canônico será criado sem explicação conceitual e precisará passar pelo fluxo de geração e validação da Biblioteca.';

export const FRPS_CREATE_GLOBAL_VALIDATED_BLOCK_MESSAGE =
  'Um ou mais itens selecionados possuem explicação conceitual validada. Para preservar o conhecimento aprovado, esses itens não podem ser promovidos enquanto estiverem validados. Remova-os da seleção ou aguarde o fluxo de reabertura para revisão.';

export function getEligibleLocalItemsForCreateGlobal(
  aliases: FrpsCatalogAdminItem[],
): FrpsCatalogAdminItem[] {
  return aliases.filter(
    (item) =>
      item.origin === 'LOCAL' &&
      !item.system &&
      !item.activeEquivalence &&
      !item.parentCanonicalId,
  );
}

export function canShowCreateGlobalCanonicalAction(params: {
  aliases: FrpsCatalogAdminItem[];
  hasSelectedCanonical: boolean;
  /** Picker manual aberto (busca sem candidato adequado ou “nenhum serve”). */
  manualPickerVisible: boolean;
  createFlowOpen: boolean;
}): boolean {
  if (params.createFlowOpen) return false;
  if (params.hasSelectedCanonical) return false;
  if (!params.manualPickerVisible) return false;
  return getEligibleLocalItemsForCreateGlobal(params.aliases).length > 0;
}

export function getCreateGlobalValidatedBlockReason(
  aliases: FrpsCatalogAdminItem[],
): string | null {
  const hasValidated = aliases.some(
    (item) => item.conceptualExplanation.status === 'VALIDATED',
  );
  return hasValidated ? FRPS_CREATE_GLOBAL_VALIDATED_BLOCK_MESSAGE : null;
}

export function resolveCreateGlobalBaseAlias(params: {
  aliases: FrpsCatalogAdminItem[];
  selectedBaseId: string | null;
}): FrpsCatalogAdminItem | null {
  const locals = getEligibleLocalItemsForCreateGlobal(params.aliases);
  if (!locals.length) return null;
  if (locals.length === 1) return locals[0] ?? null;
  if (!params.selectedBaseId) return null;
  return locals.find((item) => item.id === params.selectedBaseId) ?? null;
}

export function buildCreateGlobalPreview(params: {
  base: FrpsCatalogAdminItem;
  aliases: FrpsCatalogAdminItem[];
}): {
  baseLabel: string;
  typeLabel: string;
  riskName: string;
  originLabel: string;
  linkCount: number;
} {
  return {
    baseLabel: params.base.label,
    typeLabel: params.base.itemType,
    riskName: params.base.riskName,
    originLabel: 'LOCAL',
    linkCount: params.aliases.length,
  };
}

export function buildCreateGlobalCanonicalPayload(params: {
  base: FrpsCatalogAdminItem;
  aliases: FrpsCatalogAdminItem[];
  equivalenceType: 'SEMANTIC_ALIAS' | 'TECHNICAL_DUPLICATE';
}): {
  kind: FrpsCatalogAdminItem['kind'];
  riskId: string;
  baseAliasId: string;
  aliasIds: string[];
  equivalenceType: 'SEMANTIC_ALIAS' | 'TECHNICAL_DUPLICATE';
} {
  const aliasIds = [
    ...new Set(params.aliases.map((item) => item.id).filter(Boolean)),
  ];
  if (!aliasIds.includes(params.base.id)) {
    aliasIds.unshift(params.base.id);
  }

  return {
    kind: params.base.kind,
    riskId: params.base.riskId,
    baseAliasId: params.base.id,
    aliasIds,
    equivalenceType: params.equivalenceType,
  };
}
