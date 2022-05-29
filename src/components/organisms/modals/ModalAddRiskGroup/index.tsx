import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutUpsertRiskGroupData } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskGroupData';

import { StatusSelect } from '../../tagSelects/StatusSelect';

export const initialRiskGroupState = {
  name: '',
  status: StatusEnum.PROGRESS,
  error: '',
  id: '',
  goTo: '',
};

export const ModalAddRiskGroup = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const mutation = useMutUpsertRiskGroupData();
  const { push } = useRouter();
  const initialDataRef = useRef(initialRiskGroupState);

  const { preventUnwantedChanges } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();

  const [riskGroupData, setRiskGroupData] = useState(initialRiskGroupState);

  const onClose = () => {
    onCloseModal(ModalEnum.RISK_GROUP_ADD);
    setRiskGroupData(initialRiskGroupState);
  };

  const onSave = async () => {
    if (!riskGroupData.name) {
      setRiskGroupData({
        ...riskGroupData,
        error: 'A descrição é obrigatório',
      });
      return enqueueSnackbar('Descrição não pode estar vazio!', {
        variant: 'error',
      });
    }

    const doc = await mutation.mutateAsync({
      id: riskGroupData.id,
      name: riskGroupData.name,
      status: riskGroupData.status,
    });

    if (riskGroupData.goTo && doc)
      push(riskGroupData.goTo.replace(':docId', doc.id));

    onClose();
  };

  const onCloseUnsaved = () => {
    if (preventUnwantedChanges(riskGroupData, initialDataRef.current, onClose))
      return;
    onClose();
  };

  useEffect(() => {
    const initialData = getModalData<Partial<typeof initialRiskGroupState>>(
      ModalEnum.RISK_GROUP_ADD,
    );

    if (initialData) {
      setRiskGroupData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        initialDataRef.current = newData;

        return newData;
      });
    }
  }, [getModalData]);

  const buttons = [
    {},
    {
      text: 'ok',
      onClick: onSave,
      variant: 'contained',
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.RISK_GROUP_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8}>
        <SModalHeader
          tag={riskGroupData.id ? 'edit' : 'add'}
          onClose={onCloseUnsaved}
          title={riskGroupData.id ? 'PGR' : 'Novo documento PGR'}
        />
        <Box mt={8}>
          <SInput
            autoFocus
            value={riskGroupData.name}
            onChange={(e) =>
              setRiskGroupData((data) => ({
                ...data,
                error: '',
                name: e.target.value,
              }))
            }
            error={!!riskGroupData.error}
            helperText={riskGroupData.error}
            sx={{ width: ['100%', 600] }}
            placeholder={'Nome do documento PGR...'}
          />
        </Box>
        <SFlex gap={8} mt={10} align="center">
          <StatusSelect
            selected={riskGroupData.status}
            statusOptions={[
              StatusEnum.PROGRESS,
              StatusEnum.ACTIVE,
              StatusEnum.INACTIVE,
            ]}
            handleSelectMenu={(option) =>
              setRiskGroupData({ ...riskGroupData, status: option.value })
            }
          />
        </SFlex>
        <SModalButtons
          loading={mutation.isLoading}
          onClose={onCloseUnsaved}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
