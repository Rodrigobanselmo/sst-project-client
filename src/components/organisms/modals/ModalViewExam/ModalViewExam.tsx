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
import { getGhoName } from 'components/organisms/main/Tree/OrgTree/components/ModalEditCard/hooks/useModalCardActions';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ProtocolsRiskTable } from 'components/organisms/tables/ProtocolsRiskTable/ProtocolsRiskTable';
import { useRouter } from 'next/router';

import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IGho } from 'core/interfaces/api/IGho';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryExamsHierarchy } from 'core/services/hooks/queries/useQueryExamsHierarchy/useQueryExamsHierarchy';

import { initialRiskToolState } from '../ModalRiskTool/hooks/useModalRiskTool';

export const initialProfessionalViewState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (professional: IProfessional | IProfessional[]) => {},
  onCloseWithoutSelect: () => {},
};

const modalName = ModalEnum.EXAM_RISK_VIEW;

export const ModalViewExam: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onStackOpenModal } = useModal();
  const [selectData, setSelectData] = useState(initialProfessionalViewState);
  const [showRiskExam, setShowRiskExam] = useState(true);
  const { query, push } = useRouter();
  const { onOpenSelected } = useOpenRiskTool();

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

  const onOpenRiskToolModal = (
    homogeneousGroup: IGho | undefined,
    riskFactor: IRiskFactors,
  ) => {
    if (!query.docId) return;
    const foundGho = homogeneousGroup;

    const { viewData, ghoName } = getGhoName(
      foundGho,
      homogeneousGroup?.hierarchy?.name,
    );

    if (foundGho)
      push(
        RoutesEnum.RISK_DATA.replace(
          /:companyId/g,
          query.companyId as string,
        ).replace(/:riskGroupId/g, query.docId as string),
      ).then(() => {
        setTimeout(() => {
          onOpenSelected({
            viewData,
            viewType: ViewTypeEnum.SIMPLE_BY_RISK,
            ghoId: foundGho.id,
            ghoName: ghoName || '',
            risks: [riskFactor],
            filterKey: 'probability',
            filterValue: 'desc',
          });
        }, 500);

        onStackOpenModal(ModalEnum.RISK_TOOL, {
          riskGroupId: query.docId as string,
        } as Partial<typeof initialRiskToolState>);
      });
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
                { label: 'Relação de Exames' },
                { label: 'Relação de Protocolos' },
                { label: 'Exames Vinculados' },
              ]}
            />
          }
        >
          <Box sx={{ px: 5, pb: 10 }}>
            <ExamsRiskTable />
          </Box>
          <Box sx={{ px: 5, pb: 10 }}>
            <ProtocolsRiskTable />
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
              onHandleOrigin={(origin) => {
                onOpenRiskToolModal(origin.homogeneousGroup, origin.risk);
              }}
            />
          </Box>
        </Wizard>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
