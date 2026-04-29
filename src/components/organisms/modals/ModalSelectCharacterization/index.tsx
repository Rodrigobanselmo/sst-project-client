import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { CharacterizationTable } from 'components/organisms/tables/CharacterizationTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';

export const initialCharacterizationSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (company: ICharacterization | ICharacterization[]) => {},
  title: 'Selecione os ambientes e/ou atividades',
  multiple: false,
  companyId: undefined as string | undefined,
  workspaceId: undefined as string | undefined,
  selected: [] as ICharacterization[],
  // query: {} as IQueryCompanies,
  onCloseWithoutSelect: () => {},
};

export const ModalSelectCharacterization: FC = () => {
  const { registerModal, getModalData, findModalData, currentModal } =
    useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(
    initialCharacterizationSelectState,
  );

  useEffect(() => {
    const fromTop = getModalData(
      ModalEnum.CHARACTERIZATION_SELECT,
    ) as typeof initialCharacterizationSelectState;
    const fromStack = findModalData(
      ModalEnum.CHARACTERIZATION_SELECT,
    ) as typeof initialCharacterizationSelectState;
    const initialData =
      fromTop && Object.keys(fromTop).length ? fromTop : fromStack;

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setSelectData({
        ...initialCharacterizationSelectState,
        ...initialData,
      });
    }
  }, [currentModal, findModalData, getModalData]);

  const onCloseNoSelect = () => {
    setSelectData(initialCharacterizationSelectState);
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.CHARACTERIZATION_SELECT);
  };

  const handleSelect = (company?: ICharacterization) => {
    if (selectData.multiple && company) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != company.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [company, ...oldData.selected] };
      });
      return;
    }
    onCloseModal(ModalEnum.CHARACTERIZATION_SELECT);
    setSelectData(initialCharacterizationSelectState);
    selectData.onSelect(company || selectData.selected);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        setSelectData(initialCharacterizationSelectState);
        onCloseModal(ModalEnum.CHARACTERIZATION_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.CHARACTERIZATION_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <SText>{selectData.title}</SText>
        <Box minWidth={['100%', 600, 800]} pb={10} mt={8}>
          <CharacterizationTable
            key={`${selectData.companyId || 'no-company'}::${selectData.workspaceId || 'no-workspace'}`}
            {...(selectData.multiple
              ? { selectedData: selectData.selected }
              : {})}
            onSelectData={handleSelect}
            companyId={selectData.companyId}
            workspaceId={selectData.workspaceId}
            // query={selectData.query}
            // rowsPerPage={6}
          />
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
