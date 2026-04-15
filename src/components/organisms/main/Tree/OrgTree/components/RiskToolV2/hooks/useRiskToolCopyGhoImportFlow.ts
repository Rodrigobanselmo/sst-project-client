import { useCallback } from 'react';
import type { UseMutationResult } from 'react-query';

import { initialCopyRiskImportEntryState } from 'components/organisms/modals/ModalCopyRiskImportEntry';
import type { ModalCopyRiskSelectPayload } from 'components/organisms/modals/ModalCopyRiskSelect';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialGhoSelectState } from 'components/organisms/modals/ModalSelectGho';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import type { ICopyHomo } from 'core/services/hooks/mutations/manager/useMutCopyHomo';
import { queryGroupRiskData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { queryClient } from 'core/services/queryClient';

import { IHierarchyTreeMapObject } from '../components/RiskToolViews/RiskToolRiskView/types';

type CopyHomoMutate = UseMutationResult<unknown, unknown, ICopyHomo>;

export function useRiskToolCopyGhoImportFlow(
  riskGroupIdMemo: string,
  copyHomoMutation: CopyHomoMutate,
) {
  const { onStackOpenModal } = useModal();
  const { companyId, workspaceId } = useGetCompanyId();

  const handleCopyGHO = useCallback(
    (data: IGho | IHierarchyTreeMapObject | IHierarchy) => {
      const openRiskSelect = (gho: IGho, riskGroup: IRiskGroupData) => {
        const homoId = String(data.id).split('//');
        const isHierarchy = homoId.length > 1;
        const basePayload: ModalCopyRiskSelectPayload = {
          companyIdFrom: gho.companyId || riskGroup.companyId,
          riskGroupIdFrom: riskGroup.id,
          copyFromHomoGroupId: gho.id,
          actualGroupId: homoId[0],
          riskGroupId: riskGroupIdMemo as string,
          targetCompanyId: companyId,
          workspaceDestId: homoId.length === 2 ? homoId[1] : undefined,
          isHierarchy,
        };

        onStackOpenModal(ModalEnum.COPY_RISK_SELECT, {
          ...basePayload,
          onConfirm: async (riskFactorDataIds: string[]) => {
            await copyHomoMutation.mutateAsync({
              actualGroupId: basePayload.actualGroupId,
              riskGroupId: basePayload.riskGroupId,
              companyId: companyId,
              companyIdFrom: basePayload.companyIdFrom,
              copyFromHomoGroupId: basePayload.copyFromHomoGroupId,
              riskGroupIdFrom: basePayload.riskGroupIdFrom,
              workspaceId: basePayload.workspaceDestId,
              ...(basePayload.isHierarchy ? { type: HomoTypeEnum.HIERARCHY } : {}),
              riskFactorDataIds,
            });
          },
        } as any);
      };

      const onSelectGhoData = async (gho: IGho, riskGroup: IRiskGroupData) => {
        openRiskSelect(gho, riskGroup);
      };

      const onSelectRiskGroupData = async (
        riskGroup: IRiskGroupData,
        sourceCompanyId: string,
        workspaceFilter?: string,
      ) => {
        queryClient.invalidateQueries([QueryEnum.GHO]);
        onStackOpenModal(ModalEnum.HOMOGENEOUS_SELECT, {
          title: 'Selecione a origem da qual deseja importar riscos',
          onSelect: (gho) => onSelectGhoData(gho as IGho, riskGroup),
          companyId: sourceCompanyId,
          workspaceIdFilter: workspaceFilter,
          riskFactorGroupDataId: riskGroup.id,
        } as Partial<typeof initialGhoSelectState>);
      };

      const startDocPgr = (
        sourceCompanyId: string,
        workspaceFilter?: string,
      ) => {
        onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
          title: 'Selecione o Sistema de Gestão SST do GSE',
          onSelect: (riskGroup) =>
            onSelectRiskGroupData(
              riskGroup as IRiskGroupData,
              sourceCompanyId,
              workspaceFilter,
            ),
          companyId: sourceCompanyId,
        } as Partial<typeof initialDocPgrSelectState>);
      };

      onStackOpenModal(ModalEnum.COPY_RISK_IMPORT_ENTRY, {
        defaultCompanyId: companyId || '',
        defaultWorkspaceId: workspaceId,
        onContinue: ({
          sourceCompanyId: sid,
          workspaceId: ws,
        }: {
          sourceCompanyId: string;
          workspaceId?: string;
        }) => {
          void (async () => {
            try {
              const groups = await queryClient.fetchQuery({
                queryKey: [QueryEnum.RISK_GROUP_DATA, sid],
                queryFn: () => queryGroupRiskData(sid),
              });
              if (groups.length === 1) {
                await onSelectRiskGroupData(groups[0], sid, ws);
                return;
              }
            } catch {
              // fallback: abre seleção manual de SST
            }
            startDocPgr(sid, ws);
          })();
        },
      } as Partial<typeof initialCopyRiskImportEntryState>);
    },
    [companyId, copyHomoMutation, onStackOpenModal, riskGroupIdMemo, workspaceId],
  );

  return { handleCopyGHO, loadingCopy: copyHomoMutation.isLoading };
}
