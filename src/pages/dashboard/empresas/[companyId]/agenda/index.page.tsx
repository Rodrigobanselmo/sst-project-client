import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SCalendarWeek } from 'components/molecules/calendar/SCalendarWeek/SCalendarWeek';
import { SSidebarExamData } from 'components/molecules/calendar/SSidebarExamData/SSidebarExamData';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { StackModalAddExamSchedule } from 'components/organisms/modals/ModalAddExamSchedule/ModalAddExamSchedule';
import { HistoryScheduleExamTable } from 'components/organisms/tables/HistoryScheduleExamTable/HistoryScheduleExamTable';
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
      <SContainer>
        <SAuthShow hideIf={!hideIfIsConsultant}>
          <ScheduleAskExamTable />
        </SAuthShow>
        <SAuthShow hideIf={hideIfIsConsultant}>
          <HistoryScheduleExamTable isPending query={{ allCompanies: true }} />
        </SAuthShow>
        <HistoryScheduleExamTable mt={10} query={{ allCompanies: true }} />
        {false && (
          <Box
            sx={{
              maxHeight: 'calc(100vh - 90px)',
              display: 'flex',
              flex: 1,
              gap: '5px',
            }}
            px={[8, 8, 10]}
          >
            <SSidebarExamData />
            <SCalendarWeek />
            <button
              onClick={() =>
                onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE)
              }
            >
              open scheduler
            </button>
          </Box>
        )}
      </SContainer>
      <StackModalAddExamSchedule />
    </>
  );
};

export default Schedule;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
