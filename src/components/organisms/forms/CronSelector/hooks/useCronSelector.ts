import { useEffect, useState } from 'react';

import { initialAccessGroupsSelectState } from 'components/organisms/modals/ModalSelectAccessGroup';
import { initialUsersSelectState } from 'components/organisms/modals/ModalSelectUsers';
import {
  initialInputModalState,
  TypeInputModal,
} from 'components/organisms/modals/ModalSingleInput';
import { useSnackbar } from 'notistack';

import {
  AlertsFieldEnum,
  AlertsGroupTypeEnum,
  AlertsTypeEnum,
} from 'core/constants/maps/alert.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { IUser } from 'core/interfaces/api/IUser';
import {
  IUpsIUpserALert,
  useMutUpsertAlert,
} from 'core/services/hooks/mutations/manager/alert/useMutUpsertAlert/useMutUpsertAlert';
import { useQueryAlert } from 'core/services/hooks/queries/useQueryAlert/useQueryAlert';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import { ICronSelector } from '../types';

const translations = {
  everyText: 'A cada',
  emptyMonths: 'Mês',
  emptyMonthDays: 'Dia do mês',
  emptyMonthDaysShort: 'todos os dias',
  emptyWeekDays: 'Dia da semana',
  emptyWeekDaysShort: 'Dia',
  emptyHours: '07:00',
  emptyMinutes: 'Minuto',
  emptyMinutesForHourPeriod: 'Minuto',
  yearOption: 'Ano',
  monthOption: 'Mês',
  weekOption: 'Semana',
  dayOption: 'Dia',
  hourOption: 'Hora',
  minuteOption: 'Minuto',
  rebootOption: 'Reinício',
  prefixPeriod: 'A cada',
  prefixMonths: 'nos meses de ',
  prefixMonthDays: 'no primeiro dia de semana a partir do dia',
  prefixWeekDays: 'nos dias',
  prefixWeekDaysForMonthAndYearPeriod: 'em todo(a)',
  prefixHours: 'ás',
  prefixMinutes: '6',
  prefixMinutesForHourPeriod: '7',
  suffixMinutesForHourPeriod: '8',
  errorInvalidCron: 'Cron inválido',
  clearButtonText: 'Limpar',
  weekDays: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  months: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  altWeekDays: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  altMonths: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ],
};

export const useCronSelector = (props: ICronSelector) => {
  // useEffect(() => {
  //   if (props.value)

  // }, [props.value])

  return {
    translations,
    ...props,
  };
};

export type IUseOsReturn = ReturnType<typeof useCronSelector>;
