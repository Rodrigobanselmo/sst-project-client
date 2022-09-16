import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import { SCalendarWeek } from 'components/molecules/calendar/SCalendarWeek/SCalendarWeek';
import { SSidebarExamData } from 'components/molecules/calendar/SSidebarExamData/SSidebarExamData';
import { StackModalAddExamSchedule } from 'components/organisms/modals/ModalAddExamSchedule/ModalAddExamSchedule';
import { HistoryScheduleExamTable } from 'components/organisms/tables/HistoryScheduleExamTable/HistoryScheduleExamTable';
import { ScheduleAskExamTable } from 'components/organisms/tables/ScheduleAskExamTable/ScheduleAskExamTable';
import { NextPage } from 'next';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Schedule: NextPage = () => {
  const { onStackOpenModal } = useModal();

  return (
    <>
      <SContainer>
        <ScheduleAskExamTable />
        <HistoryScheduleExamTable query={{ allCompanies: true }} />
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
