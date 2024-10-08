import React, { FC, useEffect, useState } from 'react';

import { Box, Checkbox } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableRow } from 'components/atoms/STable';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ProfessionalsTable } from 'components/organisms/tables/ProfessonalsTable/ProfessonalsTable';

import { SCheckIcon } from 'assets/icons/SCheckIcon';

import { ProfessionalFilterTypeEnum } from 'core/constants/maps/professionals-filter.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';
import { IQueryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

export const initialProfessionalViewState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (professional: IProfessional | IProfessional[]) => {},
  title: 'Selecione o Profissional',
  multiple: false,
  query: {} as IQueryProfessionals,
  selected: [] as IProfessional[],
  isClinic: false,
  toEdit: false,
  filter: ProfessionalFilterTypeEnum.ALL,
  onCloseWithoutSelect: () => {},
  doctorResponsibleId: null as number | null,
};

export const ModalViewProfessional: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(initialProfessionalViewState);

  const updateCompany = useMutUpdateCompany();

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.PROFESSIONAL_SELECT,
    ) as typeof initialProfessionalViewState;

    // eslint-disable-next-line prettier/prettier
    if (initialData && Object.keys(initialData)?.length && !(initialData as any).passBack) {
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

  const handleSelect = (professional?: IProfessional) => {
    if (selectData.multiple && professional) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter(
          (w) => w.id != professional.id,
        );

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [professional, ...oldData.selected] };
      });
      return;
    }
    onCloseModal(ModalEnum.PROFESSIONAL_SELECT);
    setSelectData(initialProfessionalViewState);
    selectData.onSelect(professional || selectData.selected);
  };

  const handleEditResponsible = async (
    professional: IProfessional,
    selected: boolean,
  ) => {
    await updateCompany
      .mutateAsync({
        doctorResponsibleId: selected ? professional.id : null,
      })
      .then(() => {
        setSelectData((oldData) => {
          return {
            ...oldData,
            doctorResponsibleId: selected ? professional.id : null,
          };
        });
      })
      .catch(() => {});
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
      <SModalPaper
        sx={{ backgroundColor: 'grey.200' }}
        semiFullScreen
        center
        p={8}
      >
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <SText mt={-4} mr={40}>
          {selectData.title}
        </SText>

        <Box mt={8}>
          <ProfessionalsTable
            {...(selectData.multiple
              ? { selectedData: selectData.selected }
              : {})}
            {...(!selectData.toEdit ? { onSelectData: handleSelect } : {})}
            showResponsible
            loadingResponsible={updateCompany.isLoading}
            isClinic={selectData.isClinic}
            filterInitial={selectData.filter}
            query={selectData.query}
            rowsPerPage={6}
            responsibleId={selectData?.doctorResponsibleId || undefined}
            onEditResponsible={(professional, selected) => {
              handleEditResponsible(professional, selected);
            }}
          ></ProfessionalsTable>
        </Box>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
