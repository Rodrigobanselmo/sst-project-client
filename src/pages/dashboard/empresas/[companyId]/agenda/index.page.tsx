import { SContainer } from 'components/atoms/SContainer';
import { SCalendarWeek } from 'components/molecules/calendar/SCalendarWeek/SCalendarWeek';
import { SSidebarExamData } from 'components/molecules/calendar/SSidebarExamData/SSidebarExamData';
import {
  ModalAddExamSchedule,
  StackModalAddExamSchedule,
} from 'components/organisms/modals/ModalAddExamSchedule/ModalAddExamSchedule';
import { NextPage } from 'next';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Schedule: NextPage = () => {
  const { onStackOpenModal } = useModal();
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
      <button
        onClick={() => onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE)}
      >
        open scheduler
      </button>
      <StackModalAddExamSchedule />
    </SContainer>
  );
};

export default Schedule;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
