import React, { useMemo } from 'react';

import { Icon } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { EmployeeSelect } from 'components/organisms/tagSelects/EmployeeSelect';
import dayjs from 'dayjs';

import SArrowNextIcon from 'assets/icons/SArrowNextIcon';
import SCalendarIcon from 'assets/icons/SCalendarIcon';

import useCalendar, { ICalendarDay } from 'core/hooks/useCalendar';
import { dateFromNowInDays } from 'core/utils/date/date-format';
import { getTimeList } from 'core/utils/helpers/times';

import {
  STSideExamDataContainer,
  STCalendarHeaderFlex,
  STCalendarTimesFlex,
} from './styles';
import { SCalendarProps } from './types';

export const SSidebarExamData = (props: SCalendarProps) => {
  return (
    <STSideExamDataContainer {...props}>
      <EmployeeSelect
        preload
        maxWidth="100%"
        maxPerPage={10}
        handleSelect={(employee) => console.log(employee)}
        text={'Selecionar Funcionario'}
        addButton={false}
        queryEmployee={{ all: true }}
        tooltipTitle="Encontrar funcionário"
        // handleSelect={(_, list) =>
        //   setData((old) => ({ ...old, selectedEmployees: list }))
        // }
        selectedEmployees={[]}
        multiple={false}
      />
    </STSideExamDataContainer>
  );
};
