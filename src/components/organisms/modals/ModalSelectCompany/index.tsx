import React, { FC, useEffect, useState } from 'react';

import { Box, Checkbox } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableRow } from 'components/atoms/STable';
import STableLoading from 'components/atoms/STable/components/STableLoading';
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
import { ICompany } from 'core/interfaces/api/ICompany';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

export const initialCompanySelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (company: ICompany | ICompany[]) => {},
  title: 'Selecione a empresa',
  multiple: false,
  selected: [] as ICompany[],
  onCloseWithoutSelect: () => {},
};

export const ModalSelectCompany: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const { data: companies, isLoading } = useQueryCompanies();
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
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.COMPANY_SELECT);
  };

  const handleSelect = (company?: ICompany) => () => {
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
    selectData.onSelect(company || selectData.selected);
  };

  const handleAddMissingData = () => {
    onOpenModal(ModalEnum.COMPANY_ADD);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
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
      <SModalPaper center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box width={['100%', 600, 800]} mt={8}>
          {!isLoading ? (
            <SFlex direction="column" gap={5}>
              <SText mt={-4} mr={40}>
                {selectData.title}
              </SText>
              {companies.map((company) => (
                <STableRow
                  clickable
                  onClick={handleSelect(company)}
                  key={company.id}
                >
                  <SFlex align="center">
                    {selectData.multiple && (
                      <Checkbox
                        checked={
                          !!selectData.selected.find((c) => c.id === company.id)
                        }
                        size="small"
                        sx={{
                          'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
                            color: 'grey.400',
                          },
                        }}
                      />
                    )}
                    {company.name}
                  </SFlex>
                </STableRow>
              ))}
            </SFlex>
          ) : (
            <STableLoading rowGap={'10px'} />
          )}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
