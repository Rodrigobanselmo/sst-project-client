import React, { useMemo } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Box, Icon } from '@mui/material';
import { SDatePicker } from 'components/atoms/SDatePicker/SDatePicker';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import { STable, STableBody, STableHeader } from 'components/atoms/STable';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import dayjs from 'dayjs';

import SArrowBackIcon from 'assets/icons/SArrowBackIcon';
import SArrowNextIcon from 'assets/icons/SArrowNextIcon';
import SCalendarIcon from 'assets/icons/SCalendarIcon';

import useCalendar from 'core/hooks/useCalendar';
import { dateFromNowInDays } from 'core/utils/date/date-format';
import { get15Time } from 'core/utils/helpers/times';

export const STSTableBody = styled(Box)`
  display: flex;
  flex-direction: row;
  min-width: fit-content;
  padding: 2px;
  overflow-y: overlay;
  &::-webkit-scrollbar {
    border-radius: 24px;
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[500]};
    border-radius: 24px;
  }
`;

export const STSTableHeader = styled(Box)`
  display: grid;
  align-items: center;
  width: 100%;
`;

const SCalendarHeaderFlex = styled(SFlex)<{ today?: number }>`
  position: relative;
  flex: 1;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 10px 10px 0 0;
  ${(props) =>
    props.today &&
    css`
      background-color: ${props.theme.palette.secondary.light};

      .calendar_header_text {
        color: ${props.theme.palette.secondary.contrastText};
      }
    `};
`;

const Page = () => {
  const {
    calendarRows,
    todayFormatted,
    daysShort,
    monthNames,
    selected,
    selectedDate,
    getToday,
    getTodayMonth,
    getNextMonth,
    getPrevMonth,
    getNextWeek,
    getPrevWeek,
    onSetSelectedDate,
  } = useCalendar();

  const monthName = monthNames[selectedDate.getMonth()];

  const week = useMemo(() => {
    return (
      calendarRows.find(
        (week) => week.findIndex((i) => i.dateFormat == selected) != -1,
      ) || []
    );
  }, [calendarRows, selected]);

  const actualFormatDate = `${monthName} ${week?.[0]?.value || ''}-${
    week?.[week?.length - 1]?.value || ''
  } ${selectedDate.getFullYear()}`;

  const lowerTime = 6;
  const higherTime = 20;

  const timeList = useMemo(() => get15Time(lowerTime, 0, higherTime, 0), []);

  return (
    <Box height="400px">
      <SFlex>
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
            onChange={(date, e) => {
              if (date) {
                onSetSelectedDate(date);
              }
            }}
          />
        </SFlex>
      </SFlex>

      <STable rowGap={'4px'} columns={'1fr 1fr 1fr 1fr 1fr 1fr 1fr'}>
        <STSTableHeader className={'table_grid'}>
          {week.map((day, index) => {
            const isToday = day.dateFormat === todayFormatted;
            const isOldDay =
              dayjs(day.date).diff(dayjs(selectedDate), 'day') > 0;
            const monthName =
              monthNames[Number(day.dateFormat.split('-')?.[1] || 1) - 1];

            return (
              <Box key={day.dateFormat}>
                <STooltip title={dateFromNowInDays(day.date)}>
                  <SCalendarHeaderFlex
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
                  </SCalendarHeaderFlex>
                </STooltip>
              </Box>
            );
          })}
        </STSTableHeader>
        <STSTableBody maxHeight={200}>
          {week.map((day, index) => {
            const isToday = day.dateFormat === todayFormatted;
            const isOldDay =
              dayjs(day.date).diff(dayjs(selectedDate), 'day') > 0;
            const monthName =
              monthNames[Number(day.dateFormat.split('-')?.[1] || 1) - 1];

            return (
              <SFlex direction="column" flex={1} key={day.dateFormat}>
                {timeList.map((time) => {
                  return (
                    <SText key={time} fontSize={10} fontWeight="600">
                      {time}
                    </SText>
                  );
                })}
              </SFlex>
            );
          })}
        </STSTableBody>
      </STable>
      {/* <SFlex
        overflow="scroll"
        position="relative"
        gap={1}
        maxHeight="100%"
        justify="center"
      >
        {week.map((day, index) => {
          const isToday = day.dateFormat === todayFormatted;
          const isOldDay = dayjs(day.date).diff(dayjs(selectedDate), 'day') > 0;
          const monthName =
            monthNames[Number(day.dateFormat.split('-')?.[1] || 1) - 1];

          return (
            <SFlex direction="column" flex={1} key={day.dateFormat}>
              <Box>
                <STooltip title={dateFromNowInDays(day.date)}>
                  <SCalendarHeaderFlex
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
                  </SCalendarHeaderFlex>
                </STooltip>
              </Box>
              <SFlex direction="column" flex={1}>
                {timeList.map((time) => {
                  return (
                    <SText key={time} fontSize={10} fontWeight="600">
                      {time}
                    </SText>
                  );
                })}
              </SFlex>
            </SFlex>
          );
        })}
      </SFlex> */}
    </Box>
  );
};

export default Page;
