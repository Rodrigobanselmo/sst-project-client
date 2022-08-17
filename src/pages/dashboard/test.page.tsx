import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import dayjs from 'dayjs';

import useCalendar from 'core/hooks/useCalendar';

const Page = () => {
  const {
    calendarRows,
    selectedDate,
    todayFormatted,
    daysShort,
    monthNames,
    getTodayMonth,
    getNextMonth,
    getPrevMonth,
    getNextWeek,
    getPrevWeek,
    selected,
    setSelected,
  } = useCalendar();

  return (
    <div>
      {' '}
      {Object.values(calendarRows).map((cols) => {
        if (cols.findIndex((i) => i.dateFormat == selected) == -1) return null;
        return (
          <SFlex key={cols[0].dateFormat}>
            {cols.map((col, index) => {
              const isToday = col.dateFormat === todayFormatted;
              const isOldDay =
                dayjs(col.date).diff(dayjs(selectedDate), 'day') > 0;
              const toHide = false;
              return (
                <Box key={col.dateFormat}>
                  <Box>
                    <span>{col.value}</span>
                    <p
                      style={{
                        textAlign: 'left',
                        paddingLeft: 5,
                        fontSize: 14,
                        fontWeight: 'bold',
                      }}
                    >
                      {daysShort[index]}
                    </p>
                    {!toHide && (
                      <p
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          right: 5,
                          fontSize: 10,
                        }}
                      >{`${monthNames[selectedDate.getMonth()]}`}</p>
                    )}
                  </Box>
                </Box>
              );
            })}
          </SFlex>
        );
      })}
    </div>
  );
};

export default Page;
