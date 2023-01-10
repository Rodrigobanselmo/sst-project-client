/* eslint-disable quotes */
import { FC } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { ClinicInputSelect } from 'components/organisms/inputSelect/ClinicSelect/ClinicInputSelect';
import { getIsBlockedTime } from 'components/organisms/modals/ModalAddExamSchedule/components/3-evaluation/hooks/useEvaluationStep';
import dayjs from 'dayjs';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';

import { clinicScheduleMap } from 'core/constants/maps/clinic-schedule-type.map';
import { ClinicScheduleTypeEnum } from 'core/interfaces/api/IExam';
import { IScheduleBlock } from 'core/interfaces/api/IScheduleBlock';
import { dateToDate, dateToString } from 'core/utils/date/date-format';
import { getTimeList } from 'core/utils/helpers/times';
import { timeMask } from 'core/utils/masks/date.mask';

import { IExamsScheduleTable, IExamsScheduleTableProps } from '../types';

export const availableScheduleDate = (
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

export const getBlockDates = ({ row }: { row: IExamsScheduleTable }) => {
  const scheduleBlock = row.clinic?.scheduleBlocks || [];
  const scheduleRange = row?.scheduleRange || {};

  const blockDate: Date[] = [];
  const blockDateTime: Record<string, IScheduleBlock[]> = {};

  scheduleBlock.forEach((block) => {
    const start = dayjs(block.startDate);
    const end = dayjs(block.endDate);

    const diff = end.diff(start, 'day') + 1;

    for (let i = 0; i < diff; i++) {
      const date = start.add(i, 'day');
      const weekday = date.day() + 1;

      const firstTime = scheduleRange[`${weekday}-0`];
      let lastTime = scheduleRange[`${weekday}-1`];

      for (let i = 2; i < 20; i++) {
        const time = scheduleRange[`${weekday}-${i}`];
        if (!time) break;

        lastTime = time;
        continue;
      }

      const isBlockStart = block.startTime <= firstTime;
      const isBlockEnd = block.endTime >= lastTime;

      if (isBlockEnd && isBlockStart) {
        blockDate.push(date.toDate());
      } else {
        const formatDate = date.format('YYYYMMDD');
        if (!blockDateTime[formatDate]) blockDateTime[formatDate] = [];
        blockDateTime[formatDate].push(block);
      }
    }
  });

  return { blockDate, blockDateTime };
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
  company,
  disabled,
  isPendingExams,
  getBlockTimeList,
  isLoadingTime,
}) => {
  const examType =
    scheduleData.examType && employeeExamTypeMap[scheduleData.examType];
  const isAsk =
    row.scheduleType == ClinicScheduleTypeEnum.ASK &&
    !isPendingExams &&
    !company?.isConsulting;
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

  const examMim = row?.clinic?.clinicExams?.find(
    (x) => x.examMinDuration,
  )?.examMinDuration;

  const { blockDate, blockDateTime } = getBlockDates({ row });
  return (
    <SFlex width={['100%', '100%', '100%']} direction="column">
      <ClinicInputSelect
        onChange={(clinic) => {
          setData?.({ clinic, id: row.id });
        }}
        disabled={disabled}
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
                setValue={setValue}
                unmountOnChangeDefault
                name={'doneDate_' + String(row.id)}
                defaultValue={dateToDate(row?.doneDate)}
                placeholderText={
                  !isAsk ? 'Data do exame' : 'Data de preferência'
                }
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
                calendarProps={{
                  excludeDates: blockDate,
                  filterDate: (date) => {
                    const isAvailableDate = availableScheduleDate(date, row, {
                      afterDate:
                        lastComplementaryDate && lastComplementaryDate.toDate(),
                    });

                    if (!isAvailableDate) return false;

                    row.clinic?.scheduleBlocks;

                    return true;
                  },

                  disabled,
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
            <SFlex flex={1} maxWidth={isAsk ? '200px' : '100px'}>
              <Box flex={1}>
                <AutocompleteForm
                  name={'time_' + String(row.id)}
                  filterOptions={(x) => x}
                  control={control}
                  freeSolo
                  unmountOnChangeDefault
                  getOptionLabel={(option) => `${option}`}
                  inputProps={{
                    labelPosition: 'center',
                    placeholder: isAsk ? 'de 00:00' : '00:00',
                    name: 'time_' + String(row.id),
                    superSmall: true,
                    sx: {
                      input: {
                        fontSize: 13,
                      },
                    },
                  }}
                  getOptionDisabled={(time) => {
                    if (getBlockTimeList) {
                      const isblock = getIsBlockedTime(
                        getBlockTimeList,
                        time,
                        (examMim || 0) / 2,
                        { scheduleBlocks: blockDateTime, date: row.doneDate },
                      );

                      if (isblock) return isblock;
                    }
                    return notAvailableScheduleTime(time, row);
                  }}
                  onChange={(time) => {
                    setData?.({ time: time || undefined, id: row.id });
                    setValue('time_' + String(row.id), time || '');
                  }}
                  onInputChange={(e, time) => {
                    handleDebounceChange?.({
                      time: timeMask.mask(time),
                      clinic: row.clinic as any,
                      id: row.id,
                    });
                  }}
                  disabled={!row.doneDate || disabled || isLoadingTime}
                  defaultValue={String(row.time || '')}
                  setValue={(v) => setValue('time_' + String(row.id), v || '')}
                  mask={timeMask.apply}
                  label=""
                  options={getTimeList(startHour(), 0, 20, 0, examMim)}
                />
              </Box>
              {isAsk && (
                <Box flex={1}>
                  <AutocompleteForm
                    name={'time_2_' + String(row.id)}
                    filterOptions={(x) => x}
                    control={control}
                    freeSolo
                    unmountOnChangeDefault
                    getOptionLabel={(option) => `${option}`}
                    inputProps={{
                      labelPosition: 'center',
                      placeholder: 'até 00:00',
                      name: 'time_2_' + String(row.id),
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
                      setData?.({ time2: time || undefined, id: row.id });
                      setValue('time_2_' + String(row.id), time || '');
                    }}
                    onInputChange={(e, time2) => {
                      handleDebounceChange?.({
                        time2: timeMask.mask(time2),
                        clinic: row.clinic as any,
                        id: row.id,
                      });
                    }}
                    disabled={!row.doneDate || disabled}
                    defaultValue={String(row.time2 || '')}
                    setValue={(v) =>
                      setValue('time_2_' + String(row.id), v || '')
                    }
                    mask={timeMask.apply}
                    label=""
                    options={getTimeList(startHour(), 0, 20, 0)}
                  />
                </Box>
              )}
            </SFlex>
          </SFlex>

          {isPendingExams && row.doneDateAsk && (
            <Box
              sx={{
                backgroundColor: 'grey.100',
                p: '5px 10px',
                borderRadius: 1,
              }}
            >
              <SText fontWeight={600} fontSize={13}>
                <SText component="span" fontSize={12}>
                  Data de preferência
                </SText>
                : {dateToString(row.doneDateAsk)} <br />
                <SText component="span" fontSize={12}>
                  Hórario preferência
                </SText>
                : &nbsp;{row.timeAsk}
              </SText>
            </Box>
          )}

          {!hideInstruct &&
            row.scheduleType &&
            clinicScheduleMap[row.scheduleType]?.message?.(contact, {
              hideText: isPendingExams,
            })}

          {isPendingExams && (
            <SFlex gap={'2px 20px'} mt={-1} mb={2} flexWrap="wrap">
              {contact &&
                [
                  contact?.phone ? ['Telefone', contact.phone] : '',
                  contact?.phone_2 ? ['Telefone 2', contact.phone_2] : '',
                  contact?.email ? ['Email', contact.email] : '',
                ]
                  .filter((i) => i)
                  ?.map(([type, text]: any) => {
                    return (
                      <SText key={type} fontSize={13}>
                        <SText
                          fontWeight="500"
                          component={'span'}
                          fontSize={13}
                        >
                          {type}:
                        </SText>{' '}
                        {text}
                      </SText>
                    );
                  })}
            </SFlex>
          )}
        </>
      )}
    </SFlex>
  );
};
