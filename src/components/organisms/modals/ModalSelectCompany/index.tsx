import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { CompaniesTable } from 'components/organisms/tables/CompaniesTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany } from 'core/interfaces/api/ICompany';
import {
  IQueryCompanies,
  IQueryCompaniesTypes,
} from 'core/services/hooks/queries/useQueryCompanies';

export const initialCompanySelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (company: ICompany | ICompany[]) => {},
  title: 'Selecione a empresa',
  multiple: false,
  selected: [] as ICompany[],
  query: {} as IQueryCompanies,
  onCloseWithoutSelect: () => {},
  type: '' as IQueryCompaniesTypes,
};

export const ModalSelectCompany: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(initialCompanySelectState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.COMPANY_SELECT,
    ) as typeof initialCompanySelectState;

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
    setSelectData(initialCompanySelectState);
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.COMPANY_SELECT);
  };

  const handleSelect = (company?: ICompany) => {
    if (selectData.multiple && company) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != company.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [company, ...oldData.selected] };
      });
      return;
    }
    onCloseModal(ModalEnum.COMPANY_SELECT);
    setSelectData(initialCompanySelectState);
    selectData.onSelect(company || selectData.selected);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        setSelectData(initialCompanySelectState);
        onCloseModal(ModalEnum.COMPANY_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.COMPANY_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper sx={{ minWidth: ['95%', '95%', 1000] }} center p={8}>
        <SModalHeader
          tag={'select'}
          onClose={onCloseNoSelect}
          title={selectData.title}
          // title={' '}
        />

        {/* <SText>{selectData.title}</SText> */}
        <Box minWidth={['100%', 600, 800]} mt={8}>
          <CompaniesTable
            {...(selectData.multiple
              ? { selectedData: selectData.selected }
              : {})}
            query={selectData.query}
            onSelectData={handleSelect}
            rowsPerPage={6}
            type={selectData.type}
          />
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
