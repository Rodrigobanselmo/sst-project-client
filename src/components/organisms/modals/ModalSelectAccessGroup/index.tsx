import React, { FC, useEffect, useState } from 'react';

import { Box, Checkbox } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableRow } from 'components/atoms/STable';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { AccessGroupsTable } from 'components/organisms/tables/AccessGroupsTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { useQueryUsers } from 'core/services/hooks/queries/useQueryUsers';

export const initialAccessGroupsSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (user: IAccessGroup | IAccessGroup[]) => {},
  title: 'Selecione o Grupo de Acesso',
  multiple: false,
  selected: [] as IAccessGroup[],
  onCloseWithoutSelect: () => {},
};

export const ModalSelectAccessGroups: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const [selectData, setSelectData] = useState(initialAccessGroupsSelectState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.ACCESS_GROUP_SELECT,
    ) as typeof initialAccessGroupsSelectState;

    if (initialData && !(initialData as any).passBack) {
      setSelectData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.ACCESS_GROUP_SELECT);
  };

  const handleSelect = (user?: IAccessGroup) => {
    if (selectData.multiple && user) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != user.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [user, ...oldData.selected] };
      });
      return;
    }

    onCloseModal(ModalEnum.ACCESS_GROUP_SELECT);
    selectData.onSelect(user || selectData.selected);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(ModalEnum.ACCESS_GROUP_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.ACCESS_GROUP_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper
        center
        p={8}
        sx={{
          backgroundColor: 'grey.100',
        }}
      >
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8}>
          <SFlex direction="column" gap={5}>
            <SText mt={-4} mr={40}>
              {selectData.title}
            </SText>
            <AccessGroupsTable onSelectData={(v) => handleSelect(v)} />
          </SFlex>
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
