import { useSnackbar } from 'notistack';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { initialCopyRiskImportEntryState } from 'components/organisms/modals/ModalCopyRiskImportEntry';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import { initialGhoSelectState } from 'components/organisms/modals/ModalSelectGho';
import { initialWorkspaceSelectState } from 'components/organisms/modals/ModalSelectWorkspace';
import { initialImportGseConfirmState } from 'components/organisms/modals/ModalImportGseConfirm';
import { queryGroupRiskData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { queryClient } from 'core/services/queryClient';

import {
  classifyRiskGroupInventory,
  emptySstInventoryMessage,
  SST_GSE_INVENTORY_SELECT_TITLE,
} from './classify-risk-group-inventory.util';

type UseGseImportFlowParams = {
  destCompanyId?: string;
  destWorkspaceId?: string;
};

export function useGseImportFlow({
  destCompanyId,
  destWorkspaceId,
}: UseGseImportFlowParams) {
  const { onStackOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();

  const loadInventory = async (companyId: string) => {
    const groups = await queryClient.fetchQuery({
      queryKey: [QueryEnum.RISK_GROUP_DATA, companyId],
      queryFn: () => queryGroupRiskData(companyId),
    });
    return classifyRiskGroupInventory(groups);
  };

  const openConfirm = (params: {
    sourceCompanyId: string;
    sourceWorkspaceId: string;
    sourceRiskFactorGroupDataId: string;
    sourceGse: IGho;
  }) => {
    if (!destCompanyId || !destWorkspaceId) return;
    onStackOpenModal(ModalEnum.IMPORT_GSE_CONFIRM, {
      destCompanyId,
      destWorkspaceId,
      sourceCompanyId: params.sourceCompanyId,
      sourceWorkspaceId: params.sourceWorkspaceId,
      sourceRiskFactorGroupDataId: params.sourceRiskFactorGroupDataId,
      sourceGse: params.sourceGse,
    } as Partial<typeof initialImportGseConfirmState>);
  };

  const afterGseSelected = async (
    sourceCompanyId: string,
    sourceWorkspaceId: string,
    sourceGse: IGho,
  ) => {
    let choice;
    try {
      choice = await loadInventory(sourceCompanyId);
    } catch {
      enqueueSnackbar(
        'Não foi possível carregar o Sistema de Gestão SST da origem',
        { variant: 'error' },
      );
      return;
    }

    if (choice.kind === 'none') {
      enqueueSnackbar(emptySstInventoryMessage('origem'), { variant: 'error' });
      return;
    }

    if (choice.kind === 'unique') {
      openConfirm({
        sourceCompanyId,
        sourceWorkspaceId,
        sourceRiskFactorGroupDataId: choice.id,
        sourceGse,
      });
      return;
    }

    if (choice.kind !== 'multiple') return;

    onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title: SST_GSE_INVENTORY_SELECT_TITLE,
      companyId: sourceCompanyId,
      onSelect: (riskGroup: IRiskGroupData | IRiskGroupData[]) => {
        const selected = Array.isArray(riskGroup) ? riskGroup[0] : riskGroup;
        if (!selected?.id) return;
        openConfirm({
          sourceCompanyId,
          sourceWorkspaceId,
          sourceRiskFactorGroupDataId: selected.id,
          sourceGse,
        });
      },
    } as Partial<typeof initialDocPgrSelectState>);
  };

  const openGsePicker = (sourceCompanyId: string, sourceWorkspaceId: string) => {
    onStackOpenModal(ModalEnum.HOMOGENEOUS_SELECT, {
      title: 'Selecione o GSE de origem',
      companyId: sourceCompanyId,
      workspaceIdFilter: sourceWorkspaceId,
      technicalGseOnly: true,
      multiple: false,
      onSelect: (gho: IGho | IGho[]) => {
        const selected = Array.isArray(gho) ? gho[0] : gho;
        if (!selected?.id) return;
        void afterGseSelected(sourceCompanyId, sourceWorkspaceId, selected);
      },
    } as Partial<typeof initialGhoSelectState>);
  };

  const continueWithSource = (
    sourceCompanyId: string,
    sourceWorkspaceId?: string,
  ) => {
    if (!sourceWorkspaceId) {
      onStackOpenModal(ModalEnum.WORKSPACE_SELECT, {
        title: 'Selecione o Estabelecimento',
        companyId: sourceCompanyId,
        onSelect: (workspace: IWorkspace) => {
          openGsePicker(sourceCompanyId, workspace.id);
        },
      } as typeof initialWorkspaceSelectState);
      return;
    }

    openGsePicker(sourceCompanyId, sourceWorkspaceId);
  };

  const handleImportGse = () => {
    if (!destCompanyId || !destWorkspaceId) return;

    void (async () => {
      try {
        const destChoice = await loadInventory(destCompanyId);
        if (destChoice.kind === 'none') {
          enqueueSnackbar(emptySstInventoryMessage('destino'), {
            variant: 'error',
          });
          return;
        }
      } catch {
        enqueueSnackbar(
          'Não foi possível carregar o Sistema de Gestão SST do destino',
          { variant: 'error' },
        );
        return;
      }

      onStackOpenModal(ModalEnum.COPY_RISK_IMPORT_ENTRY, {
        defaultCompanyId: destCompanyId,
        defaultWorkspaceId: destWorkspaceId,
        title: 'Importar GSE — origem',
        companyLabel: 'Empresa de origem',
        workspaceLabel: 'Estabelecimento de origem',
        changeCompanyLabel: 'Usar outra empresa',
        helperText:
          'Na próxima etapa você escolhe o GSE de origem na empresa e estabelecimento indicados acima. Será criada uma cópia técnica independente no estabelecimento atual, sem cargos, heranças ou estrutura organizacional.',
        onContinue: ({
          sourceCompanyId,
          workspaceId: sourceWorkspaceId,
        }: {
          sourceCompanyId: string;
          workspaceId?: string;
        }) => {
          continueWithSource(sourceCompanyId, sourceWorkspaceId);
        },
      } as Partial<typeof initialCopyRiskImportEntryState>);
    })();
  };

  return { handleImportGse };
}
