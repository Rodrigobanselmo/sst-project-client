/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useEffect, useState } from 'react';

import { Box, Checkbox } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { STableRow } from 'components/atoms/STable';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { GhoAllTable } from 'components/organisms/tables/GhoAllTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { IGho } from 'core/interfaces/api/IGho';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const initialGhoSelectState = {
  onSelect: (gho: IGho | IGho[]) => {},
  title: 'Selecione o grupo de riscos',
  companyId: '',
  multiple: false,
  selected: [] as IGho[],
  onCloseWithoutSelect: () => {},
};

export const ModalSelectGho: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const { data: company } = useQueryCompany();
  const [selectData, setSelectData] = useState(initialGhoSelectState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.HOMOGENEOUS_SELECT,
    ) as typeof initialGhoSelectState;

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
    onCloseModal(ModalEnum.HOMOGENEOUS_SELECT);
  };

  const handleSelect = (gho?: IGho) => {
    if (selectData.multiple && gho) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != gho.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [gho, ...oldData.selected] };
      });
      return;
    }

    onCloseModal(ModalEnum.HOMOGENEOUS_SELECT);
    selectData.onSelect(gho || selectData.selected);
  };

  const handleAddMissingData = () => {
    onOpenModal(ModalEnum.WORKSPACE_ADD);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(ModalEnum.HOMOGENEOUS_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.HOMOGENEOUS_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8} mb={20}>
          {company.workspace && company.workspace.length > 0 ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                {selectData.title}
              </SText>
              <GhoAllTable
                companyId={selectData.companyId}
                onSelectData={handleSelect}
                selectedData={
                  selectData.selected.length > 0
                    ? selectData.selected
                    : undefined
                }
              />
            </SFlex>
          ) : (
            <>
              <SText mt={-4} maxWidth="400px">
                Nenhum estabelecimento cadastrado, por favor cadastre antes de
                gerar um novo documento
              </SText>
              <SButton
                onClick={handleAddMissingData}
                color="secondary"
                sx={{ mt: 5 }}
              >
                Cadastrar Estabelecimento
              </SButton>
            </>
          )}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
