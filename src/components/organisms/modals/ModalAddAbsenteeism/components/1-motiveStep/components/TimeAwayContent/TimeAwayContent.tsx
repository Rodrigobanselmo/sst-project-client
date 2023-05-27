/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SText from 'components/atoms/SText';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { DateTimeForm } from 'components/molecules/form/date-time/DateTimeForm';
import { SRadio } from 'components/molecules/form/radio';
import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';

import { dateToDate } from 'core/utils/date/date-format';
import { intMask } from 'core/utils/masks/int.mask';

import { IUseMotiveData } from '../../hooks/useMotiveData';

export const TimeAwayContent = (props: IUseMotiveData) => {
  const {
    control,
    setAbsenteeismData,
    absenteeismData,
    setValue,
    timeAway,
    addTime,
    endDate,
  } = props;

  return (
    <>
      <SFlex mt={6} align="center">
        <SRadio
          value={absenteeismData.timeUnit}
          valueField="value"
          row
          labelField="label"
          onChange={(e) =>
            setAbsenteeismData({
              ...absenteeismData,
              timeUnit: (e.target as any).value,
            })
          }
          options={[
            { value: DateUnitEnum.DAY, label: 'Dias' },
            { value: DateUnitEnum.HOUR, label: 'Horas' },
          ]}
        />
      </SFlex>

      <SText mt={10} mb={4} color="text.label" fontSize={14}>
        Data de Afastamento
        <SText component={'span'} color="error.main">
          *
        </SText>
      </SText>
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box>
          <DatePickerForm
            setValue={setValue}
            unmountOnChangeDefault
            placeholderText={'__/__/__'}
            control={control}
            defaultValue={dateToDate(absenteeismData.startDate)}
            name="startDate"
            labelPosition="top"
            sx={{ maxWidth: 240 }}
            label=""
            onChange={(date) => {
              setAbsenteeismData({
                ...absenteeismData,
                startDate: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>
        <Box mr={50}>
          <DateTimeForm
            name="startTime"
            unmountOnChangeDefault
            control={control}
            onChange={(e) =>
              setAbsenteeismData({ ...absenteeismData, startTime: e })
            }
            setValue={(v) => setValue('startTime', v)}
            defaultValue={absenteeismData.startTime || ''}
            label=""
            get15TimeArray={[6, 0, 22, 0]}
          />
        </Box>
        <Box>
          <SInput
            value={timeAway || ''}
            onChange={(e) => {
              intMask.apply(e);
              const time = e.target.value;

              setAbsenteeismData({
                ...absenteeismData,
                ...(absenteeismData.timeUnit == DateUnitEnum.HOUR && {
                  endTime: addTime(time),
                }),
                ...(absenteeismData.timeUnit == DateUnitEnum.DAY && {
                  endDate: dayjs(absenteeismData.startDate)
                    .add(Number(time || 0), 'day')
                    .toDate(),
                }),
              });
            }}
            sx={{ maxWidth: 150 }}
            InputLabelProps={{ shrink: true }}
            fullWidth
            endAdornment={
              absenteeismData.timeUnit == DateUnitEnum.DAY ? 'dias' : 'horas'
            }
            label={
              absenteeismData.timeUnit == DateUnitEnum.DAY
                ? 'Dias Afastado'
                : 'Horas Afastado'
            }
            size="small"
            labelPosition="center"
          />
        </Box>
      </SFlex>

      <SText mt={10} mb={4} color="text.label" fontSize={14}>
        Data de Retorno
        <SText component={'span'} color="error.main">
          *
        </SText>
      </SText>
      <SFlex flexWrap="wrap" mb={5} gap={5}>
        <Box>
          <DatePickerForm
            setValue={setValue}
            unmountOnChangeDefault
            placeholderText={'__/__/__'}
            control={control}
            defaultValue={dateToDate(endDate)}
            name="endDate"
            calendarProps={{
              disabled: absenteeismData.timeUnit != DateUnitEnum.DAY,
            }}
            label=""
            labelPosition="top"
            sx={{ maxWidth: 240 }}
            onChange={(date) => {
              setAbsenteeismData({
                ...absenteeismData,
                endDate: date instanceof Date ? date : undefined,
              });
            }}
          />
        </Box>
        <Box flex={1}>
          <DateTimeForm
            name="endTime"
            unmountOnChangeDefault
            control={control}
            onChange={(e) =>
              setAbsenteeismData({ ...absenteeismData, endTime: e })
            }
            setValue={(v) => setValue('endTime', v)}
            defaultValue={absenteeismData.endTime || ''}
            label=""
            get15TimeArray={[6, 0, 22, 0]}
          />
        </Box>
      </SFlex>
    </>
  );
};
