import React, { FC, useEffect, useState } from 'react';

import { Alert, Box, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { initialDocPgrSelectState } from 'components/organisms/modals/ModalSelectDocPgr';
import {
  classifyRiskGroupInventory,
  emptySstInventoryMessage,
  SST_GSE_INVENTORY_SELECT_TITLE,
} from 'components/organisms/tables/GhosTable/classify-risk-group-inventory.util';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useMutImportGse } from 'core/services/hooks/mutations/checklist/gho/useMutImportGse';
import {
  previewImportGse,
  IImportGsePreview,
} from 'core/services/hooks/mutations/checklist/gho/useMutImportGse/preview-import-gse';
import { queryGroupRiskData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { queryClient } from 'core/services/queryClient';

export const initialImportGseConfirmState = {
  destCompanyId: '' as string,
  destWorkspaceId: '' as string,
  sourceCompanyId: '' as string,
  sourceWorkspaceId: '' as string,
  sourceRiskFactorGroupDataId: '' as string,
  sourceGse: null as IGho | null,
};

const modalName = ModalEnum.IMPORT_GSE_CONFIRM;

export const ModalImportGseConfirm: FC = () => {
  const { registerModal, getModalData, findModalData, currentModal } =
    useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const { enqueueSnackbar } = useSnackbar();
  const importMutation = useMutImportGse();
  const [selectData, setSelectData] = useState(initialImportGseConfirmState);
  const [destName, setDestName] = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [preview, setPreview] = useState<IImportGsePreview | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [resolvingDest, setResolvingDest] = useState(false);

  useEffect(() => {
    const fromTop = getModalData(
      modalName,
    ) as typeof initialImportGseConfirmState;
    const fromStack = findModalData(
      modalName,
    ) as typeof initialImportGseConfirmState;
    const initialData =
      fromTop && Object.keys(fromTop).length ? fromTop : fromStack;

    if (
      initialData &&
      Object.keys(initialData).length &&
      !(initialData as any).passBack
    ) {
      setSelectData({ ...initialImportGseConfirmState, ...initialData });
      setDestName(initialData.sourceGse?.name || '');
      setDebouncedName(initialData.sourceGse?.name || '');
      setPreview(null);
      setPreviewError('');
    }
  }, [currentModal, findModalData, getModalData]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(destName), 400);
    return () => clearTimeout(timer);
  }, [destName]);

  useEffect(() => {
    const sourceGseId = selectData.sourceGse?.id;
    const sourceRiskFactorGroupDataId = selectData.sourceRiskFactorGroupDataId;
    if (!selectData.destCompanyId || !sourceGseId || !sourceRiskFactorGroupDataId)
      return;

    let cancelled = false;
    setLoadingPreview(true);
    setPreviewError('');

    void previewImportGse({
      companyId: selectData.destCompanyId,
      companyCopyFromId: selectData.sourceCompanyId,
      sourceWorkspaceId: selectData.sourceWorkspaceId,
      sourceHomogeneousGroupId: sourceGseId,
      sourceRiskFactorGroupDataId,
      name: debouncedName || selectData.sourceGse?.name,
    })
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
      })
      .catch((error) => {
        if (cancelled) return;
        setPreviewError(
          error?.response?.data?.message ||
            'Não foi possível carregar o resumo da importação.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    debouncedName,
    selectData.destCompanyId,
    selectData.sourceCompanyId,
    selectData.sourceGse?.id,
    selectData.sourceGse?.name,
    selectData.sourceRiskFactorGroupDataId,
    selectData.sourceWorkspaceId,
  ]);

  const onClose = () => {
    setSelectData(initialImportGseConfirmState);
    setDestName('');
    setDebouncedName('');
    setPreview(null);
    setPreviewError('');
    setResolvingDest(false);
    onCloseModal(modalName);
  };

  const nameConflict = !!preview?.nameConflict;
  const previewMatchesName = destName.trim() === (debouncedName || destName).trim();
  const canConfirm =
    !!destName.trim() &&
    !nameConflict &&
    previewMatchesName &&
    !loadingPreview &&
    !previewError &&
    !!selectData.sourceGse?.id &&
    !!selectData.sourceRiskFactorGroupDataId &&
    !importMutation.isLoading &&
    !resolvingDest;

  const submitImport = async (targetRiskFactorGroupDataId: string) => {
    if (!selectData.sourceGse?.id || !targetRiskFactorGroupDataId) return;

    await importMutation
      .mutateAsync({
        companyId: selectData.destCompanyId,
        companyCopyFromId: selectData.sourceCompanyId,
        sourceWorkspaceId: selectData.sourceWorkspaceId,
        sourceHomogeneousGroupId: selectData.sourceGse.id,
        sourceRiskFactorGroupDataId: selectData.sourceRiskFactorGroupDataId,
        targetRiskFactorGroupDataId,
        workspaceId: selectData.destWorkspaceId,
        name: destName.trim(),
      })
      .then(() => {
        onClose();
      })
      .catch(() => {});
  };

  const handleConfirm = async () => {
    if (!canConfirm || !selectData.sourceGse?.id) return;

    setResolvingDest(true);
    try {
      const groups = await queryClient.fetchQuery({
        queryKey: [QueryEnum.RISK_GROUP_DATA, selectData.destCompanyId],
        queryFn: () => queryGroupRiskData(selectData.destCompanyId),
      });
      const choice = classifyRiskGroupInventory(groups);

      if (choice.kind === 'none') {
        enqueueSnackbar(emptySstInventoryMessage('destino'), {
          variant: 'error',
        });
        return;
      }

      if (choice.kind === 'unique') {
        await submitImport(choice.id);
        return;
      }

      if (choice.kind !== 'multiple') return;

      onStackOpenModal(ModalEnum.DOC_PGR_SELECT, {
        title: SST_GSE_INVENTORY_SELECT_TITLE,
        companyId: selectData.destCompanyId,
        onSelect: (riskGroup: IRiskGroupData | IRiskGroupData[]) => {
          const selected = Array.isArray(riskGroup) ? riskGroup[0] : riskGroup;
          if (!selected?.id) return;
          void submitImport(selected.id);
        },
      } as Partial<typeof initialDocPgrSelectState>);
    } catch {
      enqueueSnackbar(
        'Não foi possível carregar o Sistema de Gestão SST do destino',
        { variant: 'error' },
      );
    } finally {
      setResolvingDest(false);
    }
  };

  const buttons = [
    {},
    {
      text: 'Importar',
      variant: 'contained',
      onClick: () => {
        void handleConfirm();
      },
      disabled: !canConfirm,
      loading: importMutation.isLoading || resolvingDest,
    },
  ] as IModalButton[];

  const sourceName = preview?.sourceName || selectData.sourceGse?.name || '—';
  const sourceDescription =
    preview?.sourceDescription || selectData.sourceGse?.description || '';
  const directRiskCount = preview?.directRiskCount;

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onClose}
    >
      <SModalPaper sx={{ minWidth: ['95%', 480, 520] }} center p={8}>
        <SModalHeader tag="add" onClose={onClose} title="Importar GSE" />
        <Box mt={6}>
          <SText fontSize={13} color="text.light">
            GSE de origem
          </SText>
          <SText fontSize={16} fontWeight={600} mb={3}>
            {sourceName}
          </SText>

          <SText fontSize={13} color="text.light">
            Descrição
          </SText>
          <SText fontSize={14} mb={3} sx={{ whiteSpace: 'pre-wrap' }}>
            {sourceDescription || '—'}
          </SText>

          <SText fontSize={13} color="text.light">
            Riscos diretos que serão copiados
          </SText>
          <SText fontSize={16} fontWeight={600} mb={4}>
            {loadingPreview
              ? 'Carregando…'
              : directRiskCount == null
                ? '—'
                : String(directRiskCount)}
          </SText>

          <TextField
            fullWidth
            size="small"
            label="Nome do GSE no destino"
            value={destName}
            onChange={(e) => setDestName(e.target.value)}
            inputProps={{ maxLength: 100 }}
          />

          {nameConflict ? (
            <Alert severity="warning" sx={{ mt: 3 }}>
              Já existe um grupo homogêneo com o mesmo nome nesta empresa.
              Altere o nome antes de importar.
            </Alert>
          ) : null}

          {previewError ? (
            <Alert severity="error" sx={{ mt: 3 }}>
              {previewError}
            </Alert>
          ) : null}

          <SText fontSize={12} color="text.light" mt={4}>
            A descrição da origem será copiada. Você poderá editá-la depois no
            GSE. Cargos, heranças e riscos efetivos não são importados.
          </SText>
        </Box>
        <SModalButtons onClose={onClose} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
