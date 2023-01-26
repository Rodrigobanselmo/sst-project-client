import React, { useState } from 'react';
import { Cron } from 'react-js-cron';

import { Box, BoxProps, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SSelect from 'components/atoms/SSelect';
import { FilterFieldEnum } from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import { FilterTag } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTag';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import { UnmountBox } from 'components/molecules/form/unmount-box';
import { SPageMenu } from 'components/molecules/SPageMenu';
import dayjs from 'dayjs';

import { SAlertIcon } from 'assets/icons/SAlertIcon';

import {
  alertFilterOptionsList,
  alertOptionsList,
  AlertsFieldEnum,
  AlertsGroupTypeEnum,
  AlertsTypeEnum,
} from 'core/constants/maps/alert.map';
import { weekDaysShortArr } from 'core/hooks/useCalendar';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';

import { CronSelector } from '../CronSelector';
import { useAlertForm } from './hooks/useAlertForm';
import { STBox } from './styles';

export const AlertForm = (props: BoxProps) => {
  const {
    onSave,
    loading,
    onAddSave,
    alerts,
    enqueueSnackbar,
    alertType,
    company,
    onConfigSave,
    setAlertType,
    sendMutation,
  } = useAlertForm();

  // for 3 weeks on monday should be jan 23 / feb 13 / march 6

  return (
    <STBox {...props}>
      <SFlex mb={15} align={'center'}>
        <STableTitle mb={0} mr={5}>
          Gerenciar Alertas
        </STableTitle>
      </SFlex>
      {!company.isClinic && (
        <SPageMenu
          active={alertType}
          options={alertFilterOptionsList}
          onChange={(option) => setAlertType(option as any)}
        />
      )}
      <SFlex
        sx={{
          flexWrap: 'wrap',
          gap: 10,
          mt: 10,
        }}
      >
        {alertOptionsList.map((alert) => {
          if (!alert.users.includes(alertType)) return;
          const alertValue = alerts?.[alert.value];

          const sendEmailsData = [
            {
              name: 'Grupo de permissões',
              field: AlertsFieldEnum.GROUP,
              tags: alertValue?.groups?.map((v) => ({
                name: v.name,
                id: v.id,
              })),
              systemTags: alertValue?.systemGroups?.map((v) => ({
                name: v.name,
                id: v.id,
              })),
            },
            {
              name: 'Usuários do sistemas',
              field: AlertsFieldEnum.USER,
              tags: alertValue?.users?.map((v) => ({
                name: v.email,
                id: v.id,
              })),
            },
            {
              name: 'Emails externos',
              field: AlertsFieldEnum.EMAIL,
              tags: alertValue?.emails?.map((v) => ({
                name: v,
                id: v,
              })),
            },
          ];

          const defaultConfig = {
            everyNumbersOfWeeks: 4,
            weekDays: [],
            time: 800,
          };

          return (
            <UnmountBox key={alert.value} unmountOnChangeDefault={loading}>
              <Box
                sx={{
                  minWidth: 250,
                  flex: 1,
                  p: 10,
                  borderRadius: 1,
                  backgroundColor: 'gray.50',
                }}
              >
                <SFlex>
                  <Box flex={1}>
                    <SText fontWeight={'600'} fontSize={17} mb={2}>
                      {alert.label}
                    </SText>
                    <SText color="text.light" fontSize={15}>
                      {alert.description}
                    </SText>
                  </Box>
                  <SIconButton
                    loading={sendMutation.isLoading}
                    tooltip={'Enviar alerta agora'}
                    onClick={() =>
                      alertValue?.id &&
                      sendMutation.mutate({
                        companyId: company.id,
                        type: alert?.value,
                      })
                    }
                  >
                    <Icon component={SAlertIcon} sx={{ fontSize: '1.4rem' }} />
                  </SIconButton>
                </SFlex>
                <SFlex align={'center'} mt={5}>
                  <SText color="text.light" fontSize={14} width={55}>
                    A cada
                  </SText>

                  <Box sx={{ width: 75, mr: 4 }}>
                    <SSelect
                      superSmall
                      labelPosition="center"
                      disabled={loading}
                      options={Array.from({ length: 54 }).map((_, index) => ({
                        value: index + 1,
                        content: String(index + 1),
                      }))}
                      onChange={(e) => {
                        const configJson = {
                          ...defaultConfig,
                          ...alertValue?.configJson,
                        };

                        if (e?.target?.value)
                          configJson.everyNumbersOfWeeks = e.target
                            .value as number;

                        onConfigSave({
                          companyId: company.id,
                          type: alert?.value,
                          configJson: configJson,
                        });
                      }}
                      fullWidth
                      placeholder={''}
                      label={''}
                      value={String(
                        alertValue?.configJson?.everyNumbersOfWeeks || '',
                      )}
                    />
                  </Box>

                  <SText color="text.light" fontSize={14} width={140}>
                    semanas nos dias:
                  </SText>

                  <SFlex align={'center'}>
                    {weekDaysShortArr.map((day, index) => {
                      const numDay = index + 1;

                      return (
                        <SCheckBox
                          label={day}
                          disabled={loading}
                          checked={alertValue?.configJson?.weekDays?.includes(
                            numDay,
                          )}
                          key={day}
                          onChange={() => {
                            const configJson = {
                              ...defaultConfig,
                              ...alertValue?.configJson,
                            };

                            const includes =
                              configJson.weekDays.includes(numDay);

                            if (includes) {
                              configJson.weekDays = configJson.weekDays.filter(
                                (i) => i != numDay,
                              );
                            } else {
                              configJson.weekDays.push(numDay);
                            }

                            onConfigSave({
                              companyId: company.id,
                              type: alert.value,
                              configJson: configJson,
                            });
                          }}
                        />
                      );
                    })}
                  </SFlex>

                  <SText color="text.light" fontSize={14} width={30}>
                    ás:
                  </SText>

                  <Box sx={{ width: 100, mr: 4 }}>
                    <SSelect
                      superSmall
                      labelPosition="center"
                      disabled={loading}
                      options={Array.from({ length: 15 }).map((_, index) => ({
                        value: (index + 6) * 100,
                        content: `${String(index + 6).padStart(2, '0')}:00`,
                      }))}
                      onChange={(e) => {
                        const configJson = {
                          ...defaultConfig,
                          ...alertValue?.configJson,
                        };

                        if (e?.target?.value)
                          configJson.time = e.target.value as number;

                        onConfigSave({
                          companyId: company.id,
                          type: alert?.value,
                          configJson: configJson,
                        });
                      }}
                      fullWidth
                      placeholder={'00:00'}
                      label={''}
                      value={String(alertValue?.configJson?.time || '')}
                    />
                  </Box>
                </SFlex>
                {alertValue?.nextAlert && (
                  <SText mb={6} mt={2} color="text.light" fontSize={12}>
                    (Proximo alerta no dia {dateToString(alertValue?.nextAlert)}{' '}
                    às {dateToTimeString(alertValue?.nextAlert)})
                  </SText>
                )}
                <Box mt={8}>
                  {sendEmailsData.map((sendType) => {
                    return (
                      <Box mt={8} key={sendType.name}>
                        <SFlex gap={5} mb={4}>
                          <SText color="text.main" fontSize={14}>
                            {sendType.name}
                          </SText>
                          <SButton
                            xsmall
                            variant={'contained'}
                            size="small"
                            color="success"
                            onClick={() =>
                              onAddSave({
                                companyId: company.id,
                                field: sendType.field,
                                type: alert.value,
                              })
                            }
                          >
                            +
                          </SButton>
                        </SFlex>
                        <SFlex mt={0} gap={5}>
                          {sendType.systemTags?.map((tag) => {
                            return (
                              <FilterTag
                                maxWidth={220}
                                sx={{ backgroundColor: 'grey.300' }}
                                borderColor="grey.600"
                                key={tag.id}
                                py={0}
                                onRemove={() =>
                                  enqueueSnackbar(
                                    'você não tem permissão para remover esse dado',
                                    {
                                      variant: 'warning',
                                    },
                                  )
                                }
                                tag={{
                                  name: tag.name,
                                  filterValue: String(tag.id),
                                }}
                              />
                            );
                          })}
                          {sendType.tags?.map((tag) => {
                            return (
                              <FilterTag
                                maxWidth={220}
                                key={tag.id}
                                py={0}
                                onRemove={(tag) =>
                                  onSave({
                                    companyId: company.id,
                                    field: sendType.field,
                                    id: tag.filterValue,
                                    type: alert.value,
                                    remove: true,
                                  })
                                }
                                tag={{
                                  name: tag.name,
                                  filterValue: String(tag.id),
                                }}
                              />
                            );
                          })}
                        </SFlex>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </UnmountBox>
          );
        })}
      </SFlex>
      {/* <SButton sx={{ mb: 20 }} onClick={onCopy}>
        <Icon
          component={SOsIcon}
          sx={{
            mr: 5,
            fontSize: ['1.2rem'],
            color: 'common.white',
          }}
        />
        Gerar OS para Funcionário
      </SButton> */}
      {/* <EmployeeSelect
        maxWidth="320px"
        bg="info.main"
        mb={20}
        sx={{ '*': { color: 'white !important' } }}
        maxPerPage={5}
        handleSelect={(employee: IEmployee) => {
          const id = employee?.id;
          if (id) onDownloadOS(id);
        }}
        text={'Gerar OS (Selecionar Funcionário)'}
        large
        tooltipTitle="Encontrar funcionário"
        selectedEmployees={[]}
        multiple={false}
      /> */}
    </STBox>
  );
};
