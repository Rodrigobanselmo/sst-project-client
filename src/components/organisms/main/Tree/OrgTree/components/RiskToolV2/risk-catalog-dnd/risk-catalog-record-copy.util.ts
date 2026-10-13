import { IRiskData } from 'core/interfaces/api/IRiskData';

import { isExistingControlCorrespondence } from '../utils/existing-control-correspondence.util';
import { RiskCatalogDndDragItem } from './risk-catalog-dnd.types';

/**
 * Destino de um drop/lote. `recordScoped` só é ligado na visualização por risco,
 * onde origem e destino são registros (RiskFactorData) diferentes do mesmo fator.
 */
export type RiskCatalogDropDestination = {
  riskId?: string | null;
  riskDataId?: string | null;
  recordScoped?: boolean;
};

type RiskCatalogCopySource = Pick<
  RiskCatalogDndDragItem,
  'sourceRiskId' | 'sourceRiskDataId'
>;

export const RECORD_COPY_BLOCKED_EXISTING_CONTROL =
  'Correspondências de controles existentes são informativas e não são copiadas entre GSEs.';

export const RECORD_COPY_BLOCKED_PLAN_DERIVED =
  'Medidas derivadas de ações concluídas do Plano de Ação pertencem ao estabelecimento da ação e não são copiadas entre GSEs.';

export const RECORD_COPY_BLOCKED_NO_WORKSPACE =
  'Selecione um estabelecimento para copiar medidas implantadas entre GSEs: sem ele não é possível confirmar se a medida é derivada do Plano de Ação.';

/**
 * Fora da visualização por risco, o mesmo fator é sempre origem (regra original).
 * Na visualização por risco, só o próprio registro é origem; sem identificar os
 * dois registros, a cópia é tratada como mesma origem e bloqueada.
 */
export function isRiskCatalogSourceSameAsDestination(
  source: RiskCatalogCopySource,
  destination: RiskCatalogDropDestination,
): boolean {
  if (!destination.riskId) return true;
  if (source.sourceRiskId !== destination.riskId) return false;
  if (!destination.recordScoped) return true;
  if (!source.sourceRiskDataId || !destination.riskDataId) return true;
  return source.sourceRiskDataId === destination.riskDataId;
}

export function resolveRecordCopyBlockedReason(
  item: Pick<RiskCatalogDndDragItem, 'kind' | 'catalogId'>,
  sourceRiskData?: IRiskData | null,
): string | undefined {
  const catalogId = item.catalogId == null ? '' : String(item.catalogId);

  if (item.kind === 'rec') {
    const isCorrespondence = (sourceRiskData?.recs ?? []).some(
      (rec) =>
        !!rec && String(rec.id) === catalogId && isExistingControlCorrespondence(rec),
    );
    return isCorrespondence ? RECORD_COPY_BLOCKED_EXISTING_CONTROL : undefined;
  }

  if (item.kind === 'adm' || item.kind === 'eng') {
    const derivedLinks = sourceRiskData?.riskFactorDataRecDerivedMeasures;
    if (!Array.isArray(derivedLinks)) return RECORD_COPY_BLOCKED_NO_WORKSPACE;
    const isDerived = derivedLinks.some(
      (link) => !!link && String(link.derivedRecMedId) === catalogId,
    );
    return isDerived ? RECORD_COPY_BLOCKED_PLAN_DERIVED : undefined;
  }

  return undefined;
}

export function withRecordCopySource(
  item: RiskCatalogDndDragItem,
  sourceRiskData?: IRiskData | null,
): RiskCatalogDndDragItem {
  const catalogId = item.catalogId == null ? '' : String(item.catalogId);
  const sourceRec =
    item.kind === 'rec'
      ? (sourceRiskData?.recs ?? []).find((rec) => !!rec && String(rec.id) === catalogId)
      : undefined;

  return {
    ...item,
    sourceRiskDataId: sourceRiskData?.id || undefined,
    ...(sourceRec?.status ? { catalogStatus: String(sourceRec.status) } : {}),
    recordCopyBlockedReason: resolveRecordCopyBlockedReason(item, sourceRiskData),
  };
}
