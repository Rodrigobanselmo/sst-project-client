import React, { useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { useMutAddChecklist } from 'core/services/hooks/mutations/checklist/checklist/useMutAddChecklist';

import { StatusSelect } from '../../tagSelects/StatusSelect';

const initialState = {
  name: '',
  status: StatusEnum.PROGRESS,
  error: '',
};

export const ModalAddChecklist = () => {
  const { registerModal } = useRegisterModal();
  const { onCloseModal } = useModal();
  const mutation = useMutAddChecklist();

  const { preventUnwantedChanges } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();

  const [checklistData, setChecklistData] = useState(initialState);

  const onClose = () => {
    onCloseModal(ModalEnum.CHECKLIST_ADD);
    setChecklistData(initialState);
  };

  const onSave = async () => {
    if (!checklistData.name) {
      setChecklistData({ ...checklistData, error: 'Name é obrigatório' });
      return enqueueSnackbar('Nome não pode estar vazio!', {
        variant: 'error',
      });
    }

    await mutation
      .mutateAsync({
        name: checklistData.name,
        status: checklistData.status,
      })
      .catch(() => {});
    onClose();
  };

  const onCloseUnsaved = () => {
    if (preventUnwantedChanges(checklistData, initialState, onClose)) return;
    onClose();
  };

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
      {...registerModal(ModalEnum.CHECKLIST_ADD)}
      keepMounted={false}
      onClose={onCloseUnsaved}
    >
      <SModalPaper p={8}>
        <SModalHeader
          tag="add"
          onClose={onCloseUnsaved}
          title={'Novo checklist'}
        />
        <Box mt={8}>
          <SInput
            autoFocus
            value={checklistData.name}
            onChange={(e) =>
              setChecklistData((data) => ({
                ...data,
                error: '',
                name: e.target.value,
              }))
            }
            error={!!checklistData.error}
            helperText={checklistData.error}
            sx={{ width: ['100%', 600] }}
            placeholder={'Nome do checklist...'}
          />
        </Box>
        <SFlex gap={8} mt={10} align="center">
          <StatusSelect
            selected={checklistData.status}
            statusOptions={[
              StatusEnum.PROGRESS,
              StatusEnum.ACTIVE,
              StatusEnum.INACTIVE,
            ]}
            handleSelectMenu={(option) =>
              setChecklistData({ ...checklistData, status: option.value })
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
