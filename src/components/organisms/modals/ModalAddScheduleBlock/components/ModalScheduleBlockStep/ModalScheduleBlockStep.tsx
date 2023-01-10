/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import { DatePickerForm } from 'components/molecules/form/date-picker/DatePicker';
import { DateTimeForm } from 'components/molecules/form/date-time/DateTimeForm';
import { InputForm } from 'components/molecules/form/input';
import { SelectForm } from 'components/molecules/form/select';
import { ClinicsTable } from 'components/organisms/tables/ClinicsTable/ClinicsTable';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { StatusEnum } from 'project/enum/status.enum';

import {
  scheduleBlockOptionsList,
  ScheduleBlockTypeEnum,
} from 'core/interfaces/api/IScheduleBlock';
import { dateToDate } from 'core/utils/date/date-format';

import { IUseEditScheduleBlock } from '../../hooks/useAddScheduleBlock';

export const ModalScheduleBlockStep = ({
  scheduleblockData,
  control,
  setScheduleblockData,
  setValue,
  handleSelectClinic,
  scheduleblock,
  isClinic,
}: IUseEditScheduleBlock) => {
  return (
    <SFlex sx={{ minWidth: [300, 600, 800] }} direction="column" mt={8}>
      <Box flex={2}>
        <InputForm
          setValue={setValue}
          defaultValue={scheduleblockData.name}
          label="Justificativa"
          labelPosition="top"
          control={control}
          placeholder={'justificativa simplificada...'}
          name="name"
          size="small"
        />
      </Box>

      <SFlex mt={10} flexWrap="wrap" gap={5}>
        <SFlex maxWidth={400} flex={1} flexWrap="wrap" gap={5}>
          <Box flex={1}>
            <DatePickerForm
              unmountOnChangeDefault
              placeholderText={'__/__/__'}
              control={control}
              defaultValue={dateToDate(scheduleblockData.startDate)}
              name="startDate"
              labelPosition="top"
              sx={{ maxWidth: 240 }}
              label="Data de Início*"
              onChange={(date) => {
                setScheduleblockData({
                  ...scheduleblockData,
                  startDate: date instanceof Date ? date : undefined,
                  ...(date instanceof Date &&
                    !scheduleblockData.startDate && {
                      endDate: date,
                      startTime: '00:00',
                      endTime: '23:59',
                    }),
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
                setScheduleblockData({ ...scheduleblockData, startTime: e })
              }
              setValue={(v) => setValue('startTime', v)}
              defaultValue={scheduleblockData.startTime || ''}
              label="Hora"
              get15TimeArray={[0, 0, 23, 59]}
            />
          </Box>
        </SFlex>

        <SFlex maxWidth={400} flex={1} flexWrap="wrap" gap={5}>
          <Box flex={1}>
            <DatePickerForm
              unmountOnChangeDefault
              placeholderText={'__/__/__'}
              control={control}
              defaultValue={dateToDate(scheduleblockData.endDate)}
              name="endDate"
              labelPosition="top"
              sx={{ maxWidth: 240 }}
              label="Data de Fim*"
              onChange={(date) => {
                setScheduleblockData({
                  ...scheduleblockData,
                  endDate: date instanceof Date ? date : undefined,
                });
              }}
            />
          </Box>
          <Box mr={50}>
            <DateTimeForm
              name="endTime"
              unmountOnChangeDefault
              control={control}
              onChange={(e) =>
                setScheduleblockData({ ...scheduleblockData, endTime: e })
              }
              setValue={(v) => setValue('endTime', v)}
              defaultValue={scheduleblockData.endTime || ''}
              label="Hora"
              get15TimeArray={[0, 0, 23, 59]}
            />
          </Box>
        </SFlex>
      </SFlex>

      <Box mt={10}>
        <InputForm
          setValue={setValue}
          defaultValue={scheduleblockData.description}
          label="Justificativa Adicional (Opcional)"
          labelPosition="top"
          control={control}
          placeholder={'descrição...'}
          name="description"
          size="small"
          multiline
          minRows={2}
          maxRows={3}
        />
      </Box>

      <Box mt={10} mb={5} flex={2}>
        <SelectForm
          defaultValue={String(scheduleblockData.type)}
          label="Tipo"
          unmountOnChangeDefault
          setValue={setValue}
          control={control}
          name="type"
          placeholder="selecione tipo..."
          size="small"
          onChange={(e) => {
            if (e.target.value) {
              setScheduleblockData({
                ...scheduleblockData,
                type: e.target.value as ScheduleBlockTypeEnum,
              });
            }
          }}
          labelPosition="center"
          options={scheduleBlockOptionsList}
        />
      </Box>

      {!isClinic && (
        <Box ml={7}>
          <SSwitch
            onChange={() => {
              setScheduleblockData({
                ...scheduleblockData,
                allCompanies: !scheduleblockData.allCompanies,
                ...(!scheduleblockData.allCompanies && {
                  applyOnCompanies: [],
                }),
              });
            }}
            checked={scheduleblockData.allCompanies}
            label="Aplicar bloqueio em todas as clínicas"
            sx={{ mr: 4 }}
            color="text.light"
          />
        </Box>
      )}

      <Box ml={7}>
        <SSwitch
          onChange={() => {
            setScheduleblockData({
              ...scheduleblockData,
              yearRecurrence: !scheduleblockData.yearRecurrence,
            });
          }}
          checked={scheduleblockData.yearRecurrence}
          label="Bloqueio com recorrência anual"
          sx={{ mr: 4 }}
          color="text.light"
        />
      </Box>

      {!isClinic && !scheduleblockData.allCompanies && (
        <Box minWidth={['100%', 600, 800]} mt={20}>
          <ClinicsTable
            selectedData={scheduleblockData.applyOnCompanies.map(
              ({ id }) => id,
            )}
            simpleShow
            {...(scheduleblockData.id &&
              scheduleblockData.applyOnCompanies.length &&
              scheduleblockData.applyOnCompanies.every((s) =>
                scheduleblock?.applyOnCompanies?.find((i) => i.id == s.id),
              ) && {
                query: { scheduleBlockId: scheduleblockData.id },
              })}
            onSelectData={handleSelectClinic}
            rowsPerPage={6}
          />
        </Box>
      )}

      {!!scheduleblockData.id && (
        <StatusSelect
          sx={{ maxWidth: '90px', mt: 10 }}
          selected={scheduleblockData.status}
          statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
          handleSelectMenu={(option) =>
            setScheduleblockData((old) => ({
              ...old,
              status: option.value,
            }))
          }
        />
      )}
    </SFlex>
  );
};
