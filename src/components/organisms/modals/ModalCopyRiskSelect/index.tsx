import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { STagRisk } from 'components/atoms/STagRisk';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { queryRiskData } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { useQuery } from 'react-query';

/** Rótulo legível mesmo quando a API retorna `riskFactor` parcial (ex.: só subtipos). */
function getImportRiskRowLabel(row: IRiskData): string {
  const rf = row.riskFactor;
  const fromName = rf?.name?.trim?.();
  if (fromName) return fromName;
  const fromSub = rf?.subTypes?.[0]?.sub_type?.name?.trim?.();
  if (fromSub) return fromSub;
  const fromOrigin = row.origin?.trim?.();
  if (fromOrigin) return fromOrigin;
  return row.riskId || '—';
}

export type ModalCopyRiskSelectPayload = {
  companyIdFrom: string;
  riskGroupIdFrom: string;
  copyFromHomoGroupId: string;
  actualGroupId: string;
  riskGroupId: string;
  targetCompanyId?: string;
  workspaceDestId?: string;
  isHierarchy: boolean;
};

export type ModalCopyRiskSelectModalData = ModalCopyRiskSelectPayload & {
  onConfirm: (riskFactorDataIds: string[]) => Promise<void>;
};

export const initialCopyRiskSelectState: Partial<ModalCopyRiskSelectModalData> =
  {
    onConfirm: async () => {},
  };

const modalName = ModalEnum.COPY_RISK_SELECT;

export const ModalCopyRiskSelect: FC = () => {
  const { registerModal, getModalData, findModalData, currentModal } =
    useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState<Partial<ModalCopyRiskSelectModalData>>(
    initialCopyRiskSelectState,
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const isOnStack = currentModal.some((m) => m.name === modalName);
    if (!isOnStack) return;

    const fromStack = findModalData<ModalCopyRiskSelectModalData>(modalName);
    const fromTop = getModalData(modalName) as ModalCopyRiskSelectModalData;
    const raw =
      (fromStack && Object.keys(fromStack).length
        ? fromStack
        : fromTop && Object.keys(fromTop).length
          ? fromTop
          : null) || ({} as ModalCopyRiskSelectModalData);

    if (!raw || !Object.keys(raw).length) return;

    const rest = { ...(raw as ModalCopyRiskSelectModalData) };
    delete (rest as { passBack?: boolean }).passBack;

    const companyIdFrom = rest.companyIdFrom;
    if (
      companyIdFrom &&
      rest.copyFromHomoGroupId &&
      rest.riskGroupIdFrom &&
      rest.actualGroupId &&
      rest.riskGroupId
    ) {
      setSelectData({ ...initialCopyRiskSelectState, ...rest });
      setSelectedIds(new Set());
    }
  }, [currentModal, findModalData, getModalData]);

  const payload = selectData as ModalCopyRiskSelectModalData;

  const { data: risks = [], isLoading } = useQuery(
    [
      QueryEnum.RISK_DATA,
      'copy-select',
      payload?.companyIdFrom,
      payload?.riskGroupIdFrom,
      payload?.copyFromHomoGroupId,
    ],
    () =>
      payload?.companyIdFrom
        ? queryRiskData(
            payload.companyIdFrom,
            payload.riskGroupIdFrom,
            payload.copyFromHomoGroupId,
          )
        : Promise.resolve([] as IRiskData[]),
    {
      enabled: !!payload?.companyIdFrom,
      staleTime: 1000 * 60,
    },
  );

  const activeRisks = useMemo(
    () => (risks || []).filter((r) => !r.endDate),
    [risks],
  );

  useEffect(() => {
    if (activeRisks.length) {
      setSelectedIds(new Set(activeRisks.map((r) => r.id)));
    }
  }, [activeRisks]);

  const allSelected =
    activeRisks.length > 0 &&
    activeRisks.every((r) => selectedIds.has(r.id));

  const someSelected = activeRisks.some((r) => selectedIds.has(r.id));

  const toggleAll = useCallback(() => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(activeRisks.map((r) => r.id)));
  }, [activeRisks, allSelected]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onCloseNoSelect = () => {
    setSelectData(initialCopyRiskSelectState);
    setSelectedIds(new Set());
    onCloseModal(modalName);
  };

  const handleConfirm = async () => {
    if (!payload?.onConfirm || selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      await payload.onConfirm(Array.from(selectedIds));
      onCloseNoSelect();
    } finally {
      setSubmitting(false);
    }
  };

  const buttons = [
    {},
    {
      text: 'Importar selecionados',
      variant: 'contained',
      onClick: () => void handleConfirm(),
      disabled: !selectedIds.size || submitting,
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseNoSelect}
      sx={{ zIndex: 5000 }}
    >
      <SModalPaper sx={{ minWidth: ['95%', '95%', 900] }} center p={8}>
        <SModalHeader
          tag="select"
          onClose={onCloseNoSelect}
          title="Selecione os riscos a importar"
        />
        <Box mt={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={toggleAll}
              />
            }
            label="Selecionar todos"
          />
        </Box>
        <Box mt={2} maxHeight={420} overflow="auto">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                <TableCell>Risco</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    <SText color="text.light">Carregando…</SText>
                  </TableCell>
                </TableRow>
              ) : activeRisks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2}>
                    <SText color="text.light">
                      Nenhum risco ativo encontrado neste grupo.
                    </SText>
                  </TableCell>
                </TableRow>
              ) : (
                activeRisks.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: 'text.primary',
                        maxWidth: 520,
                        verticalAlign: 'middle',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          minWidth: 0,
                        }}
                      >
                        {row.riskFactor?.type ? (
                          <STagRisk
                            riskFactor={row.riskFactor}
                            hideRiskName
                          />
                        ) : null}
                        <SText
                          component="span"
                          fontSize={14}
                          color="text.primary"
                          sx={{ wordBreak: 'break-word', lineHeight: 1.35 }}
                        >
                          {getImportRiskRowLabel(row)}
                        </SText>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
