import React, { Dispatch, SetStateAction, useState } from 'react';
import { Cron } from 'react-js-cron';

import { Box } from '@mui/material';

import { useCronSelector } from './hooks/useCronSelector';
import { ICronSelector } from './types';

export const CronSelector = (props: ICronSelector) => {
  const { translations, value, setValue } = useCronSelector(props);

  return (
    <Box {...props}>
      <Cron
        allowedDropdowns={[
          'period',
          'months',
          'month-days',
          'week-days',
          'hours',
        ]}
        // className={`${isMonthSelected ? 'react-js-cron-month-selected' : ''}`}
        allowEmpty={'never'}
        allowedPeriods={['month', 'week', 'year']}
        locale={translations}
        value={value}
        setValue={setValue}
      />
    </Box>
  );
};
