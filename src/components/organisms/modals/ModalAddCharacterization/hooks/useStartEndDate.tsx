import type { Dispatch, SetStateAction } from 'react';
import { Alert, Box } from '@mui/material';
import { SstDateField } from '@v2/features/sst-operational/SstDateField';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { initialBlankState } from '../../ModalBlank/ModalBlank';
import {
  createStartEndDateDraft,
  resolveStartEndDates,
  validateStartEndDates,
  type LegacyPeriodDates,
  type StartEndDateDraft,
} from './start-end-date-model';

type PeriodModalData = StartEndDateDraft & { submitted?: boolean };
type SetPeriodModalData = Dispatch<SetStateAction<PeriodModalData>>;

export const useStartEndDate = () => {
  const { onStackOpenModal } = useModal();

  const selectStartEndDate = (
    // Preserve the existing public callback: its consumers still declare
    // Date-only fields, although clearing has always supplied null. The model
    // and compatibility bridge below retain the actual nullable contract.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cb: (dates: any) => void,
    options: LegacyPeriodDates = {},
  ) => {
    // Keep validation in ModalBlank's existing instance: reopening it discards
    // a partially typed date, which must remain visible for correction.
    let updateModalData: SetPeriodModalData | undefined;
    const content = (setData: SetPeriodModalData, data: PeriodModalData) => {
      updateModalData = setData;
      const errors = validateStartEndDates(data);
      const change = (field: 'startDate' | 'endDate', value: string) =>
        setData((current) => ({
          ...current,
          [field]: value,
          [`${field}Changed`]: true,
          submitted: false,
        }));
      const validity = (field: 'startDate' | 'endDate', valid: boolean) =>
        setData((current) =>
          current[`${field}Valid`] === valid
            ? current
            : { ...current, [`${field}Valid`]: valid },
        );

      return (
        <Box
          sx={{
            width: { xs: '100%', sm: '560px' },
            maxWidth: '100%',
            pb: '16px',
          }}
        >
          <Alert severity="info" sx={{ mb: '24px' }}>
            A condição vale desde a data de início e deixa de valer na data
            informada em “Válido antes de”. Deixe esse campo vazio enquanto
            continuar vigente.
          </Alert>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              alignItems: 'start',
              gap: '16px',
            }}
          >
            <SstDateField
              id="period-start-date"
              label="Data de início"
              value={data.startDate}
              onChange={(value) => change('startDate', value)}
              onValidityChange={(valid) => validity('startDate', valid)}
              error={!!errors.order || (!!data.submitted && !!errors.startDate)}
              helperText={
                (data.submitted && errors.startDate) ||
                'Opcional quando o cadastro ainda não exige uma vigência.'
              }
            />
            <SstDateField
              id="period-end-date"
              label="Válido antes de"
              value={data.endDate}
              onChange={(value) => change('endDate', value)}
              onValidityChange={(valid) => validity('endDate', valid)}
              error={!!errors.order || (!!data.submitted && !!errors.endDate)}
              helperText={
                (data.submitted && errors.endDate) ||
                errors.order ||
                'Esta data não faz parte do período. Vazio = sem encerramento.'
              }
            />
          </Box>
        </Box>
      );
    };

    const onSelect = (data: PeriodModalData, onClose?: () => void) => {
      if (Object.values(validateStartEndDates(data)).some(Boolean)) {
        updateModalData?.((current) => ({ ...current, submitted: true }));
        return;
      }
      cb(resolveStartEndDates(data, options));
      onClose?.();
    };

    onStackOpenModal(ModalEnum.MODAL_BLANK, {
      ...createStartEndDateDraft(options),
      onSelect,
      content,
      handleOnClose: true,
      closeButtonText: 'Cancelar',
      title: 'Definir período de vigência',
    } as Partial<typeof initialBlankState>);
  };

  return { selectStartEndDate };
};

export type IUseStartEndDate = ReturnType<typeof useStartEndDate>;
