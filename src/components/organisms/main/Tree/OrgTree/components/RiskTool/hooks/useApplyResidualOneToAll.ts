import { useCallback, useMemo, useState } from 'react';

import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';
import { useSnackbar } from 'notistack';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import {
  IUpsertRiskData,
} from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';

import { ViewsDataEnum } from '../utils/view-data-type.constant';
import { getEligibleForBulkResidualOne } from '../utils/riskToolResidualEligibility.util';
import { useColumnAction } from './useColumnAction';

export const buildResidualOneUpsertPayload = (
  riskData: IRiskData,
  riskId: string,
  riskGroupId: string,
  viewDataType: ViewsDataEnum,
  getPathById: (id: string | number) => (string | number)[],
): IUpsertRiskData => {
  const homogeneousGroupId = String(riskData.homogeneousGroupId).split('//')[0];

  const payload: IUpsertRiskData = {
    id: riskData.id,
    probabilityAfter: 1,
    riskId,
    riskFactorGroupDataId: riskGroupId,
    homogeneousGroupId,
  };

  if (viewDataType === ViewsDataEnum.HIERARCHY && riskData.hierarchyId) {
    const workspaceId = getPathById(riskData.hierarchyId)[1];
    if (workspaceId != null && workspaceId !== '') {
      return {
        ...payload,
        type: HomoTypeEnum.HIERARCHY,
        workspaceId: String(workspaceId),
      };
    }
  }

  return payload;
};

export const useApplyResidualOneToAll = (riskGroupId: string) => {
  const risk = useAppSelector(selectRisk);
  const viewDataType = useAppSelector((state) => state.riskAdd.viewData);
  const { companyId } = useGetCompanyId();
  const { getPathById } = useHierarchyTreeActions();
  const { onHandleSelectSave } = useColumnAction();
  const { preventDelete } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();
  const [isApplying, setIsApplying] = useState(false);

  const { data: riskDataList = [] } = useQueryRiskData(
    riskGroupId,
    risk?.id ?? '',
  );

  const eligibleItems = useMemo(
    () => getEligibleForBulkResidualOne(riskDataList),
    [riskDataList],
  );

  const applyToAll = useCallback(async () => {
    if (!risk?.id || !riskGroupId || eligibleItems.length === 0) return;

    setIsApplying(true);
    let successCount = 0;
    let failureCount = 0;

    for (const riskData of eligibleItems) {
      try {
        const payload = buildResidualOneUpsertPayload(
          riskData,
          risk.id,
          riskGroupId,
          viewDataType,
          getPathById,
        );
        await onHandleSelectSave(payload, riskData, { keepEmpty: true });
        successCount += 1;
      } catch {
        failureCount += 1;
      }
    }

    if (companyId) {
      await queryClient.invalidateQueries([
        QueryEnum.RISK_DATA,
        companyId,
        riskGroupId,
        risk.id,
      ]);
    }

    setIsApplying(false);

    if (successCount > 0) {
      enqueueSnackbar(
        failureCount > 0
          ? `${successCount} vínculo(s) atualizado(s). ${failureCount} falha(s).`
          : `${successCount} vínculo(s) atualizado(s) com probabilidade residual 1.`,
        { variant: failureCount > 0 ? 'warning' : 'success' },
      );
    } else if (failureCount > 0) {
      enqueueSnackbar('Não foi possível atualizar os vínculos.', {
        variant: 'error',
      });
    }
  }, [
    companyId,
    eligibleItems,
    enqueueSnackbar,
    getPathById,
    onHandleSelectSave,
    risk?.id,
    riskGroupId,
    viewDataType,
  ]);

  const openConfirmAndApply = useCallback(() => {
    const count = eligibleItems.length;
    if (!count) return;

    preventDelete(
      applyToAll,
      `Serão atualizados ${count} vínculo(s) para probabilidade residual 1. Deseja continuar?`,
      {
        title: 'Aplicar residual 1 em todos',
        confirmText: 'Confirmar',
        confirmCancel: 'Cancelar',
        tag: 'warning',
      },
    );
  }, [applyToAll, eligibleItems.length, preventDelete]);

  return {
    eligibleCount: eligibleItems.length,
    isApplying,
    openConfirmAndApply,
  };
};
