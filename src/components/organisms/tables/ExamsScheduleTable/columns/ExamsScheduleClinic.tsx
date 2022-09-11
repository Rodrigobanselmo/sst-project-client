/* eslint-disable quotes */
import { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import dayjs from 'dayjs';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';

import { clinicScheduleMap } from 'core/constants/maps/clinic-schedule-type.map';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { dateToDate } from 'core/utils/date/date-format';
import { get15Time } from 'core/utils/helpers/times';
import { timeMask } from 'core/utils/masks/date.mask';

import { IExamsScheduleTable, IExamsScheduleTableProps } from '../types';

export const notAvailableScheduleDate = (
  date: Date,
  row: { scheduleRange?: Record<string, string>; isAttendance?: boolean },
  options?: { afterDate?: Date },
) => {
  const dateJS = dayjs(date);

  if (dateJS.isBefore(dayjs().add(-1, 'day').toDate())) return false;

  if (options && options.afterDate) {
    if (dateJS.isBefore(dayjs(options.afterDate).toDate())) return false;
  }

  const day = dateJS.day();

  return !!row.scheduleRange && !!row.scheduleRange[`${day + 1}-0`];
};

export const notAvailableScheduleTime = (
  time: string,
  row: { doneDate?: Date; scheduleRange?: Record<string, string> },
) => {
  const date = row.doneDate;
  const dateJS = dayjs(date);
  const day = dateJS.day();
  const timeValue = Number(time.replace(':', ''));

  if (!!row.scheduleRange && !!row.scheduleRange[`${day + 1}-0`]) {
    for (let index = 0; index < 30; index = index + 2) {
      const range1 = row.scheduleRange[`${day + 1}-${index}`];
      if (!range1) return true;

      const range1Value = Number(range1.replace(':', ''));
      if (range1Value == timeValue) return false;

      const range2 = row.scheduleRange[`${day + 1}-${index + 1}`];
      if (!range2) return true;

      const range2Value = Number(range2.replace(':', ''));
      if (range2Value == timeValue) return false;

      if (timeValue > range1Value && timeValue < range2Value) return false;
    }
  }

  return true;
};

export const ExamsScheduleClinicColumn: FC<
  IExamsScheduleTableProps & { row: IExamsScheduleTable }
> = ({
  setData,
  control,
  setValue,
  handleDebounceChange,
  scheduleData,
  row,
  lastComplementaryDate,
  hideInstruct,
}) => {
  const examType =
    scheduleData.examType && employeeExamTypeMap[scheduleData.examType];

  const contact = row.clinic?.contacts?.find((i) => i.isPrincipal);

  const startHour = () => {
    const date = row.doneDate;
    const dateJS = dayjs(date);
    const day = dateJS.day();

    if (!!row.scheduleRange && !!row.scheduleRange[`${day + 1}-0`]) {
      return Number(row.scheduleRange[`${day + 1}-0`].split(':')[0]) || 0;
    }

    return 0;
  };

  return (
    <SFlex direction="column">
      <ClinicInputSelect
        onChange={(clinic) => {
          setData?.({ clinic, id: row.id });
        }}
        inputProps={{
          placeholder: 'clínica',
          superSmall: true,
          sx: {
            input: {
              fontSize: 13,
            },
          },
        }}
        defaultValue={row?.clinic}
        unmountOnChangeDefault
        name={'clinic_' + String(row.id)}
        label=""
        control={control}
        addMore={false}
        query={{
          clinicExamsIds: [row.id],
          ...(examType && { [examType.type]: true }),
        }}
      />
      {row.clinic?.id && (
        <>
          <SFlex>
            <Box flex={1}>
              <DatePickerForm
                label=""
                control={control}
                unmountOnChangeDefault
                name={'doneDate_' + String(row.id)}
                defaultValue={dateToDate(row?.doneDate)}
                placeholderText="Data do exame"
                sx={{
                  input: {
                    fontSize: 13,
                    margin: 0,
                    py: 1,
                    px: 3,
                  },
                  svg: {
                    fontSize: 20,
                  },
                }}
                // mask={null}
                calendarProps={{
                  filterDate: (date) =>
                    notAvailableScheduleDate(date, row, {
                      afterDate:
                        lastComplementaryDate && lastComplementaryDate.toDate(),
                    }),
                  // showTimeSelect: true,
                  // timeClassName: handleColor,
                  // showTimeSelectOnly: true,
                  // timeCaption: 'Time',
                  // timeCaption: 'horário',
                  // timeIntervals: 15,
                  // dateFormat: "d 'de' MMMM 'de' yyyy 'ás' HH:mm",
                  // dateFormat: "d 'de' MMMM 'de' yyyy",
                }}
                superSmall={true}
                labelPosition="center"
                onChange={(date) => {
                  setData?.({
                    id: row.id,
                    doneDate: date instanceof Date ? date : undefined,
                    time: '',
                    clinic: row.clinic as any,
                  });
                }}
              />
            </Box>
            <Box flex={1} maxWidth="100px">
              <AutocompleteForm
                name={'time_' + String(row.id)}
                filterOptions={(x) => x}
                control={control}
                freeSolo
                unmountOnChangeDefault
                getOptionLabel={(option) => `${option}`}
                inputProps={{
                  labelPosition: 'center',
                  placeholder: '00:00',
                  name: 'time_' + String(row.id),
                  superSmall: true,
                  sx: {
                    input: {
                      fontSize: 13,
                    },
                  },
                }}
                getOptionDisabled={(time) =>
                  notAvailableScheduleTime(time, row)
                }
                onChange={(time) => {
                  setData?.({ time: time || undefined, id: row.id });
                  setValue('time_' + String(row.id), time || '');
                }}
                onInputChange={(e, time) => {
                  handleDebounceChange?.({
                    time,
                    clinic: row.clinic as any,
                    id: row.id,
                  });
                }}
                disabled={!row.doneDate}
                defaultValue={String(row.time || '')}
                setValue={(v) => setValue('time_' + String(row.id), v || '')}
                mask={timeMask.apply}
                label=""
                options={get15Time(startHour(), 0, 20, 0)}
              />
            </Box>
          </SFlex>

          {!hideInstruct &&
            row.scheduleType &&
            clinicScheduleMap[row.scheduleType]?.message?.(contact)}
        </>
      )}
    </SFlex>
  );
};
