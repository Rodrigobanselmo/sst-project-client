import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import { SCalendarWeek } from 'components/molecules/calendar/SCalendarWeek/SCalendarWeek';
import { SSidebarExamData } from 'components/molecules/calendar/SSidebarExamData/SSidebarExamData';
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

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Schedule: NextPage = () => {
  const { onStackOpenModal } = useModal();
  const { data: company } = useQueryCompany();

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

        <SWizardBox>
          <Wizard
            header={
              <WizardTabs
                options={[
                  { label: 'Exames Vencidos' },
                  { label: 'Exames Agendados' },
                  { label: 'Todos os Exames' },
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
              />
            </Box>
            <Box sx={{ px: 10, pb: 10 }}>
              <HistoryScheduleExamTable
                mt={10}
                query={{ allCompanies: true }}
              />
            </Box>
          </Wizard>
        </SWizardBox>
      </SContainer>
      <StackModalAddExamSchedule />
      <StackHistoryScheduleExamTable />
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
