import React, { FC, useEffect, useState } from 'react';
import { Wizard } from 'react-use-wizard';

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
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ExamsTable } from 'components/organisms/tables/ExamsTable/ExamsTable';
import { ProfessionalsTable } from 'components/organisms/tables/ProfessonalsTable/ProfessonalsTable';

import { ProfessionalFilterTypeEnum } from 'core/constants/maps/professionals-filter.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { IQueryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

export const initialProfessionalViewState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (professional: IProfessional | IProfessional[]) => {},
  onCloseWithoutSelect: () => {},
};

const modalName = ModalEnum.EXAM_RISK_VIEW;

export const ModalViewExam: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(initialProfessionalViewState);

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialProfessionalViewState;

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
    onCloseModal(modalName);
  };

  const buttons = [{}] as IModalButton[];

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper
        sx={{ backgroundColor: 'grey.200' }}
        semiFullScreen
        center
        p={8}
      >
        <SModalHeader tag={'edit'} onClose={onCloseNoSelect} title=" " />

        <Wizard
          header={
            <WizardTabs
              options={[
                { label: 'Riscos e Exames' },
                { label: 'Exames Cadastrados' },
              ]}
            />
          }
        >
          <Box sx={{ px: 5, pb: 10 }}>
            <ExamsRiskTable />
          </Box>
          <Box sx={{ px: 5, pb: 10 }}>
            <ExamsTable />
          </Box>
        </Wizard>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
