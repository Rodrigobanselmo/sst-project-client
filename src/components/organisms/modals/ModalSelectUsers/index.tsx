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

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IUser } from 'core/interfaces/api/IUser';
import { useQueryUsers } from 'core/services/hooks/queries/useQueryUsers';

export const initialUsersSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (user: IUser | IUser[]) => {},
  title: 'Selecione o usuário',
  multiple: false,
  selected: [] as IUser[],
  onCloseWithoutSelect: () => {},
};

export const ModalSelectUsers: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const { data: users } = useQueryUsers();
  const [selectData, setSelectData] = useState(initialUsersSelectState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.USER_SELECT,
    ) as typeof initialUsersSelectState;

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
    onCloseModal(ModalEnum.USER_SELECT);
  };

  const handleSelect = (user?: IUser) => () => {
    if (selectData.multiple && user) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != user.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [user, ...oldData.selected] };
      });
      return;
    }

    onCloseModal(ModalEnum.USER_SELECT);
    selectData.onSelect(user || selectData.selected);
  };

  const handleAddMissingData = () => {
    onOpenModal(ModalEnum.WORKSPACE_ADD);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(ModalEnum.USER_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.USER_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />
        <Box mt={8}>
          {users && users.length > 0 ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                {selectData.title}
              </SText>
              {users
                .filter((i) => i.name)
                .map((work) => (
                  <STableRow
                    clickable
                    onClick={handleSelect(work)}
                    key={work.id}
                  >
                    <SFlex align="center">
                      <Checkbox
                        checked={
                          !!selectData.selected.find((w) => w.id === work.id)
                        }
                        size="small"
                        sx={{
                          'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                            color: 'grey.400',
                          },
                        }}
                      />
                      {work.name}
                    </SFlex>
                  </STableRow>
                ))}
            </SFlex>
          ) : (
            <>
              <SText mt={-4} maxWidth="400px">
                Nenhum usuário cadastrado, por favor cadastre um usuário
              </SText>
              {/* <SButton /> //! add user button
                onClick={handleAddMissingData}
                color="secondary"
                sx={{ mt: 5 }}
              >
                Cadastrar Estabelecimento
              </SButton> */}
            </>
          )}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
