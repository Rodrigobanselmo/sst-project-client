import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

export const FRPS_UNLINK_CANONICAL_ACTION_LABEL = 'Desvincular do canônico';

export const FRPS_UNLINK_DEFAULT_REVOKE_REASON =
  'Correção de equivalência na Biblioteca de Explicabilidade FRPS.';

export const FRPS_INVALID_SYSTEM_REFERENCE_CHIP_LABEL =
  'Referência global inválida';

export const FRPS_INVALID_SYSTEM_REFERENCE_TOOLTIP =
  'Este registro histórico não possui uma recomendação system ativa e compatível para geração conceitual.';

export const FRPS_UNLINK_SUCCESS_MESSAGE =
  'Item desvinculado do canônico com sucesso.';

export function canShowFrpsUnlinkFromCanonical(params: {
  isMaster: boolean;
  hasActiveEquivalence: boolean;
}): boolean {
  return Boolean(params.isMaster && params.hasActiveEquivalence);
}

export function buildFrpsUnlinkImpactCopy(params: {
  origin: FrpsCatalogAdminItem['origin'];
}): { base: string; originSpecific: string } {
  return {
    base:
      'Após a desvinculação, este item deixará de reutilizar a explicação conceitual do canônico atual. O item e seu histórico serão preservados. Nenhuma explicação será copiada ou apagada.',
    originSpecific:
      params.origin === 'GLOBAL'
        ? 'Por ser um item global válido, ele voltará a usar sua própria identidade conceitual.'
        : 'Por ser um item local, ficará sem canônico até receber uma nova equivalência.',
  };
}

export function isFrpsUnlinkRevokeReasonValid(reason: string): boolean {
  return reason.trim().length > 0;
}
