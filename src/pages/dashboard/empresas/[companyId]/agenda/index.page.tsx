import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import { SAuthShow } from 'components/molecules/SAuthShow';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { StackModalAddExamSchedule } from 'components/organisms/modals/ModalAddExamSchedule/ModalAddExamSchedule';
import { HistoryExpiredExamCompanyTable } from 'components/organisms/tables/HistoryExpiredExamCompanyTable/HistoryExpiredExamCompanyTable';
import { HistoryScheduleExamCompanyTable } from 'components/organisms/tables/HistoryScheduleExamCompanyTable/HistoryScheduleExamCompanyTable';
import {
  HistoryScheduleExamTable,
  StackHistoryScheduleExamTable,
} from 'components/organisms/tables/HistoryScheduleExamTable/HistoryScheduleExamTable';
import { ScheduleAskExamTable } from 'components/organisms/tables/ScheduleAskExamTable/ScheduleAskExamTable';
import { NextPage } from 'next';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { useState } from 'react';
import { IFilterTableData } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { ScheduleMedicalVisitTable } from 'components/organisms/tables/ScheduleMedicalVisitTable/ScheduleMedicalVisitTable';
import { ModalEditScheduleMedicalVisit } from 'components/organisms/modals/ModalEditScheduleMedicalVisit/ModalEditScheduleMedicalVisit';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';

const Schedule: NextPage = () => {
  const { userCompanyId } = useGetCompanyId();
  const { data: company } = useQueryCompany(userCompanyId);
  const [filter, setFilter] = useState<IFilterTableData | undefined>(undefined);

  const hideIfIsClinic = company.isClinic;
  const hideIfIsConsultant = company.isConsulting;

  return (
    <>
      <SHeaderTag title={'Agenda'} />
      <SContainer>
        <SAuthShow hideIf={!hideIfIsConsultant}>
          <SWizardBox sx={{ px: 10, py: 10 }} mb={20}>
            <ScheduleAskExamTable />
          </SWizardBox>
        </SAuthShow>
        <SAuthShow hideIf={hideIfIsConsultant}>
          <SWizardBox sx={{ px: 10, py: 10 }} mb={20}>
            <HistoryScheduleExamTable
              isHideEmpty
              isPending
              query={{ allCompanies: true }}
              mb={20}
            />
          </SWizardBox>
        </SAuthShow>

        <Wizard
          header={
            <WizardTabs
              options={[
                { label: 'Funcionários' },
                { label: 'Exames Agendados' },
                { label: 'Todos os Exames' },
                { label: 'Visita Médica' },
              ]}
            />
          }
        >
          <Box sx={{ px: 10, pb: 10 }}>
            <HistoryExpiredExamCompanyTable mt={10} />
          </Box>
          <Box sx={{ px: 10, pb: 10 }}>
            <HistoryScheduleExamCompanyTable
              mt={10}
              query={{ allCompanies: true }}
              setFilter={setFilter}
              filter={filter}
            />
          </Box>
          <Box sx={{ px: 10, pb: 10 }}>
            <HistoryScheduleExamTable mt={10} query={{ allCompanies: true }} />
          </Box>
          <Box sx={{ px: 10, pb: 10 }}>
            <ScheduleMedicalVisitTable mt={10} />
          </Box>
        </Wizard>
      </SContainer>
      <ModalEditEmployeeHisExamClinic />
      <StackModalAddExamSchedule />
      <StackHistoryScheduleExamTable />
      <ModalEditScheduleMedicalVisit />
    </>
  );
};

export default Schedule;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});

// {false && (
//   <Box
//     sx={{
//       maxHeight: 'calc(100vh - 90px)',
//       display: 'flex',
//       flex: 1,
//       gap: '5px',
//     }}
//     px={[8, 8, 10]}
//   >
//     <SSidebarExamData />
//     <SCalendarWeek />
//     <button
//       onClick={() =>
//         onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE)
//       }
//     >
//       open scheduler
//     </button>
//   </Box>
// )}
