import { RoutesEnum } from 'core/enums/routes.enums';

import type { RiskMatrixBrowseItem } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

export function getRiskMatricesPath(companyId: string) {
  return RoutesEnum.RISK_MATRICES.replace(':companyId', companyId);
}

export function getRiskMatrixVersionEditorPath(
  companyId: string,
  matrixId: string,
  versionId: string,
) {
  return RoutesEnum.RISK_MATRIX_VERSION.replace(':companyId', companyId)
    .replace(':matrixId', matrixId)
    .replace(':versionId', versionId);
}

export function resolveCreatedRiskMatrixEditorPath(
  companyId: string,
  created: Pick<RiskMatrixBrowseItem, 'id' | 'draftVersion'>,
) {
  if (!companyId || !created.id || !created.draftVersion?.id) return null;

  return getRiskMatrixVersionEditorPath(
    companyId,
    created.id,
    created.draftVersion.id,
  );
}
