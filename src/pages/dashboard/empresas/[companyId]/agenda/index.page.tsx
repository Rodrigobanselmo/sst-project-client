import { SContainer } from 'components/atoms/SContainer';
import { SCalendarWeek } from 'components/molecules/calendar/SCalendarWeek/SCalendarWeek';
import { SSidebarExamData } from 'components/molecules/calendar/SSidebarExamData/SSidebarExamData';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Schedule: NextPage = () => {
  return (
    <SContainer
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
    </SContainer>
  );
};

export default Schedule;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
