import React, { useState } from 'react';

import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { STagSelect } from 'components/molecules/STagSelect';
import { useSnackbar } from 'notistack';

import { statusOptionsConstant } from 'core/constants/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { StatusEnum } from 'core/enums/status.enum';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

const initialState = {
  name: '',
  status: StatusEnum.PROGRESS,
  error: '',
};

export const ModalAddChecklist = () => {
  const { registerModal } = useRegisterModal();
  const { onCloseModal } = useModal();

  const { preventUnwantedChanges } = usePreventAction();
  const { enqueueSnackbar } = useSnackbar();

  const [checklistData, setChecklistData] = useState(initialState);

  const onSave = () => {
    if (!checklistData.name) {
      setChecklistData({ ...checklistData, error: 'Name é obrigatório' });
      return enqueueSnackbar('Nome não pode estar vazio!', {
        variant: 'error',
      });
    }
  };

  const onCloseUnsaved = () => {
    const close = () => {
      onCloseModal(ModalEnum.CHECKLIST_ADD);
    };

    if (preventUnwantedChanges(checklistData, initialState, close)) return;
    close();
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
        <SModalHeader tag="add" onClose={onCloseUnsaved} title={'Criar'} />
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
          <STagSelect
            options={Object.keys(StatusEnum).map((key) => ({
              ...statusOptionsConstant[key as StatusEnum],
              iconColor: statusOptionsConstant[key as StatusEnum].color,
            }))}
            text={statusOptionsConstant[checklistData.status].name}
            large
            icon={CircleOutlinedIcon}
            iconProps={{
              sx: {
                color: statusOptionsConstant[checklistData.status].color,
                mr: 1,
                fontSize: '18px',
              },
            }}
            handleSelectMenu={(option) =>
              setChecklistData({ ...checklistData, status: option.value })
            }
          />
        </SFlex>
        <SModalButtons onClose={onCloseUnsaved} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
