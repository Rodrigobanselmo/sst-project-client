import React, { FC, useEffect, useState } from 'react';
import { Wizard } from 'react-use-wizard';

import { Box, LinearProgress } from '@mui/material';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ExamList } from 'components/organisms/main/Tree/OrgTree/components/ModalEditCard/components/ExamList/ExamList';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';

import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { useQueryExamsHierarchy } from 'core/services/hooks/queries/useQueryExamsHierarchy/useQueryExamsHierarchy';

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
  const [showRiskExam, setShowRiskExam] = useState(true);

  const { data: exams, isLoading: loadingExams } = useQueryExamsHierarchy(1);

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
                { label: 'Exames Vinculados' },
              ]}
            />
          }
        >
          <Box sx={{ px: 5, pb: 10 }}>
            <ExamsRiskTable />
          </Box>
          <Box sx={{ px: 5, pb: 10 }}>
            {loadingExams && <LinearProgress />}
            <>
              <STableTitle
                subtitle={
                  <>
                    Aqui você pode observar todos os exames vinculados
                    diretamente a um cargo, grupo homogênio, atividate, etc
                  </>
                }
                icon={SRiskFactorIcon}
              >
                Exames vinculados
              </STableTitle>
            </>
            <ExamList
              bgCard="grey.50"
              exams={exams}
              showRiskExam={showRiskExam}
              // onHandleOrigin={(origin) =>
              //   onOpenRiskTool(origin.homogeneousGroup, origin.risk)
              // }
            />
          </Box>
        </Wizard>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
