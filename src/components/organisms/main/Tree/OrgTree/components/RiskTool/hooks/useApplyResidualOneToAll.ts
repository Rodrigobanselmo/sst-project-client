import { useCallback, useMemo, useState } from 'react';

import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';
import { useSnackbar } from 'notistack';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { prepareWorkspaceProbabilityWrite } from 'core/utils/workspace-probability-evaluation.util';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import {
  riskDataByRiskQueryKeyPrefix,
  useQueryRiskData,
} from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';

import {
  BulkResidualOneItem,
  getBulkResidualOneScope,
} from '../utils/riskToolResidualEligibility.util';
import { buildResidualOneUpsertPayload } from './build-residual-one-upsert-payload.util';
import { useColumnAction } from './useColumnAction';

export { buildResidualOneUpsertPayload } from './build-residual-one-upsert-payload.util';

export const useApplyResidualOneToAll = (riskGroupId: string) => {
  const risk = useAppSelector(selectRisk);
  const viewDataType = useAppSelector((state) => state.riskAdd.viewData);
  const { companyId } = useGetCompanyId();
  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const { upsertRiskData } = useColumnAction();
  const { preventDelete } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();
  const [isApplying, setIsApplying] = useState(false);

  const { data: riskDataList = [] } = useQueryRiskData(
    riskGroupId,
    risk?.id ?? '',
  );

  const { data: groups = [] } = useQueryGHOAll();

  const eligibleItems = useMemo(
    () =>
      getBulkResidualOneScope({
        riskDataList,
        groups,
        headerWorkspaceId,
      }),
    [groups, headerWorkspaceId, riskDataList],
  );

  const prepareItem = useCallback(
    (item: BulkResidualOneItem, riskId: string) =>
      prepareWorkspaceProbabilityWrite({
        values: buildResidualOneUpsertPayload(
          item.riskData,
          riskId,
          riskGroupId,
          viewDataType,
        ),
        isQuantity: item.riskData.isQuantity,
        originKind: item.isCharacterization
          ? 'CHARACTERIZATION'
          : item.riskData.originKind,
        headerWorkspaceId,
      }),
    [headerWorkspaceId, riskGroupId, viewDataType],
  );

  const applyToAll = useCallback(async () => {
    if (!risk?.id || !riskGroupId || eligibleItems.length === 0) return;

    const needsEstablishment = eligibleItems.some(
      (item) => !prepareItem(item, risk.id).ok,
    );
    if (needsEstablishment) {
      enqueueSnackbar(
        'Selecione o estabelecimento no cabeçalho para gravar o residual deste GSE.',
        { variant: 'warning' },
      );
      return;
    }

    setIsApplying(true);
    let successCount = 0;
    let failureCount = 0;

    for (const item of eligibleItems) {
      try {
        const prepared = prepareItem(item, risk.id);
        if (!prepared.ok) {
          failureCount += 1;
          continue;
        }
        await upsertRiskData.mutateAsync({
          ...prepared.values,
          keepEmpty: true,
        });
        successCount += 1;
      } catch {
        failureCount += 1;
      }
    }

    if (companyId) {
      await queryClient.invalidateQueries(
        riskDataByRiskQueryKeyPrefix({
          companyId,
          riskGroupId,
          riskId: risk.id,
        }),
      );
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
    prepareItem,
    upsertRiskData,
    risk?.id,
    riskGroupId,
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
