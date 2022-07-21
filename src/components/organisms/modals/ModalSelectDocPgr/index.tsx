/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, useEffect, useState } from 'react';

import { Box, Checkbox } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
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
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

import { EmptyDocPgrData } from '../empty/EmptyDocPgrData';
import { EmptyHierarchyData } from '../empty/EmptyHierarchyData';

export const initialDocPgrSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (company: IRiskGroupData | IRiskGroupData[]) => {},
  companyId: undefined as unknown as string,
  title: 'Selecione a empresa',
  open: false,
  multiple: false,
  removeIds: [] as string[],
  selected: [] as IRiskGroupData[],
  onCloseWithoutSelect: () => {},
};

export const ModalSelectDocPgr: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, getStackModal } = useModal();
  const [selectData, setSelectData] = useState(initialDocPgrSelectState);
  const { data: riskGroupData, isLoading } = useQueryRiskGroupData(
    selectData.companyId,
  );
  const { data: company } = useQueryCompany();

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.DOC_PGR_SELECT,
    ) as typeof initialDocPgrSelectState;

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

  useEffect(() => {
    const isOpen = !!getStackModal().find(
      (modal) => modal.name === ModalEnum.DOC_PGR_SELECT,
    );

    const initialData = getModalData(
      ModalEnum.DOC_PGR_SELECT,
    ) as typeof initialDocPgrSelectState;

    if (
      isOpen &&
      riskGroupData &&
      riskGroupData.length === 1 &&
      !initialData.open
    ) {
      initialData.onSelect(riskGroupData[0]);
      setSelectData(initialDocPgrSelectState);
      onCloseModal(ModalEnum.DOC_PGR_SELECT);
    }
  }, [getModalData, getStackModal, onCloseModal, riskGroupData, selectData]);

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    setSelectData(initialDocPgrSelectState);
    onCloseModal(ModalEnum.DOC_PGR_SELECT);
  };

  const handleSelect = (docPgr: IRiskGroupData) => () => {
    if (selectData.multiple && docPgr) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != docPgr.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [docPgr, ...oldData.selected] };
      });
      return;
    }

    onCloseModal(ModalEnum.DOC_PGR_SELECT);
    setSelectData(initialDocPgrSelectState);
    selectData.onSelect(docPgr || selectData.selected);
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
      {...registerModal(ModalEnum.DOC_PGR_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <Box mt={8}>
          {!isLoading ? (
            <>
              {company.hierarchyCount ? (
                riskGroupData.length !== 0 ? (
                  <SFlex direction="column" gap={5}>
                    <SText mt={-4} mr={40}>
                      {selectData.title}
                    </SText>
                    {riskGroupData.map((work) => {
                      if (selectData.removeIds.includes(work.id)) return null;

                      return (
                        <STableRow
                          clickable
                          onClick={handleSelect(work)}
                          key={work.id}
                        >
                          <SFlex align="center">
                            {selectData.multiple && (
                              <Checkbox
                                checked={
                                  !!selectData.selected.find(
                                    (c) => c.id === company.id,
                                  )
                                }
                                size="small"
                                sx={{
                                  'svg[data-testid="CheckBoxOutlineBlankIcon"]':
                                    {
                                      color: 'grey.400',
                                    },
                                }}
                              />
                            )}
                            {work.name}
                          </SFlex>
                        </STableRow>
                      );
                    })}
                  </SFlex>
                ) : (
                  <EmptyDocPgrData />
                )
              ) : (
                <EmptyHierarchyData />
              )}
            </>
          ) : (
            <STableLoading rowGap={'10px'} />
          )}
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
