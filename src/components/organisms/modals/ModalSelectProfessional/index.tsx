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
import { useQueryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

export const initialProfessionalSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (user: IUser | IUser[]) => {},
  title: 'Selecione o usuário',
  multiple: false,
  selected: [] as IUser[],
  onCloseWithoutSelect: () => {},
};

export const ModalSelectProfessional: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const { data: professional } = useQueryProfessionals();
  const [selectData, setSelectData] = useState(initialProfessionalSelectState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.PROFESSIONAL_SELECT,
    ) as typeof initialProfessionalSelectState;

    if (initialData) {
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
    onCloseModal(ModalEnum.PROFESSIONAL_SELECT);
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

    onCloseModal(ModalEnum.PROFESSIONAL_SELECT);
    selectData.onSelect(user || selectData.selected);
  };

  const handleAddMissingData = () => {
    onOpenModal(ModalEnum.WORKSPACE_ADD);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(ModalEnum.PROFESSIONAL_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.PROFESSIONAL_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8}>
          {professional && professional.length > 0 ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                {selectData.title}
              </SText>
              {professional.map((work) => (
                <STableRow clickable onClick={handleSelect(work)} key={work.id}>
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
