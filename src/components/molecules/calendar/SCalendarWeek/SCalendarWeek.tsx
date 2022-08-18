import React, { useMemo } from 'react';

import { Box, Icon } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import dayjs from 'dayjs';

import SArrowNextIcon from 'assets/icons/SArrowNextIcon';
import SCalendarIcon from 'assets/icons/SCalendarIcon';

import useCalendar, { ICalendarDay } from 'core/hooks/useCalendar';
import { dateFromNowInDays } from 'core/utils/date/date-format';
import { get15Time } from 'core/utils/helpers/times';

import {
  STCalendarContainerBox,
  STCalendarHeaderFlex,
  STCalendarTimesFlex,
} from './styles';
import { SCalendarProps } from './types';

export const SCalendarWeek = (props: SCalendarProps) => {
  const {
    calendarRows,
    todayFormatted,
    daysShort,
    monthNames,
    selected,
    selectedDate,
    getToday,
    getNextWeek,
    getPrevWeek,
    onSetSelectedDate,
  } = useCalendar();

  const week = useMemo(() => {
    return (
      calendarRows.find(
        (week) => week.findIndex((i) => i.dateFormat == selected) != -1,
      ) || []
    );
  }, [calendarRows, selected]);

  const actualFormatDate = `${monthNames[selectedDate.getMonth()]} ${
    week?.[0]?.value || ''
  }-${week?.[week?.length - 1]?.value || ''} ${selectedDate.getFullYear()}`;

  const lowerTime = 6;
  const higherTime = 20;

  const timeList = useMemo(() => get15Time(lowerTime, 0, higherTime, 0, 2), []);

  const getWeekDaysConst = (day: ICalendarDay) => {
    const isToday = day.dateFormat === todayFormatted;
    const isOldDay = dayjs(day.date).diff(dayjs(selectedDate), 'day') > 0;
    const monthName =
      monthNames[Number(day.dateFormat.split('-')?.[1] || 1) - 1];

    return { isToday, isOldDay, monthName };
  };

  return (
    <STCalendarContainerBox {...props}>
      <SFlex mb={5}>
        <SFlex align="center">
          <SIconButton onClick={getPrevWeek} size="small">
            <Icon
              component={SArrowNextIcon}
              sx={{ fontSize: '1rem', transform: 'rotate(180deg)' }}
            />
          </SIconButton>
          <STagButton
            onClick={getToday}
            text={'Hoje'}
            tooltipTitle="Voltar para o dia atual"
          />
          <SIconButton onClick={getNextWeek} size="small">
            <Icon component={SArrowNextIcon} sx={{ fontSize: '1rem' }} />
          </SIconButton>
        </SFlex>
        <SFlex>
          <SDatePicker
            customInput={
              <SFlex sx={{ cursor: 'pointer' }} center>
                <SIconButton size="small">
                  <Icon component={SCalendarIcon} sx={{ fontSize: '1rem' }} />
                </SIconButton>
                <SText style={{ minWidth: 'fit-content' }}>
                  {actualFormatDate}
                </SText>
              </SFlex>
            }
            onChange={(date) => {
              if (date) {
                onSetSelectedDate(date);
              }
            }}
          />
        </SFlex>
      </SFlex>

      <SFlex
        overflow="auto"
        position="relative"
        gap={0}
        direction="column"
        maxHeight="100%"
      >
        <SFlex
          sx={{ backgroundColor: 'background.default' }}
          position="sticky"
          top={0}
          gap={0}
          flex={1}
          bottom={0}
        >
          <Box
            sx={{
              width: 30,
              fontSize: 8,
              display: 'flex',
              alignItems: 'end',
              pb: 2,
            }}
          >
            tempo
          </Box>
          {week.map((day, index) => {
            const { isToday, monthName } = getWeekDaysConst(day);
            return (
              <SFlex flex={1} key={day.dateFormat}>
                <STooltip title={dateFromNowInDays(day.date)}>
                  <STCalendarHeaderFlex
                    today={isToday ? 1 : 0}
                    px={5}
                    py={3}
                    flex={0}
                    align="center"
                  >
                    <SText
                      className="calendar_header_text"
                      fontSize={14}
                      component="span"
                    >
                      {day.value}
                    </SText>
                    <SText
                      className="calendar_header_text"
                      fontSize={14}
                      fontWeight="600"
                    >
                      {daysShort[index]}
                    </SText>
                    <SText
                      className="calendar_header_text"
                      sx={{
                        position: 'absolute',
                        bottom: 2,
                        right: 5,
                        fontSize: 10,
                      }}
                    >
                      {monthName}
                    </SText>
                  </STCalendarHeaderFlex>
                </STooltip>
              </SFlex>
            );
          })}
        </SFlex>
        <SFlex gap={0} mt={0}>
          <SFlex minWidth={30} gap={0} flex={0} direction="column">
            {timeList.map((time) => {
              const is15Min = false;
              const is30Min = time?.slice(-2) === '30';
              return (
                <SText
                  sx={{
                    height: 30,
                    borderTop: is15Min ? '' : '1px solid',
                    // borderBottom: is15Min ? '' : '1px solid',
                    borderColor: is30Min ? 'grey.400' : 'grey.400',
                    display: 'flex',
                    alignItems: 'start',
                  }}
                  key={time}
                  fontSize={is15Min ? 7 : 10}
                  fontWeight="600"
                >
                  {!is15Min ? time : '-'}
                </SText>
              );
            })}
          </SFlex>
          {week.map((day) => {
            return (
              <STCalendarTimesFlex
                gap={0}
                direction="column"
                key={day.dateFormat}
              >
                {timeList.map((time) => {
                  const is30Min = time?.slice(-2) === '30';
                  return (
                    <SText
                      component="span"
                      sx={{
                        height: 30,
                        borderTop: '1px solid',
                        borderColor: is30Min ? 'grey.300' : 'grey.400',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      key={time}
                      fontWeight="600"
                    />
                  );
                })}
              </STCalendarTimesFlex>
            );
          })}
        </SFlex>
      </SFlex>
    </STCalendarContainerBox>
  );
};
