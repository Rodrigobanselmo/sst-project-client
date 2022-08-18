import React, { useMemo } from 'react';

import { SCalendarWeek } from 'components/molecules/calendar/SCalendarWeek/SCalendarWeek';
import { ModalScheduleExam } from 'components/organisms/modals/schedule/ModalScheduleExam/ModalScheduleExam';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';

const Page = () => {
  const { onStackOpenModal } = useModal();
  // return <SCalendarWeek />;
  return (
    <div>
      <button onClick={() => onStackOpenModal(ModalEnum.SCHEDULE_EXAM)}>
        q
      </button>
      <ModalScheduleExam />
    </div>
  );
};

export default Page;
