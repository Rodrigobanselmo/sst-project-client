/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import { onlyNumbers } from '@brazilian-utils/brazilian-utils';
import { Box, BoxProps } from '@mui/material';
import AutocompleteSelect from 'components/atoms/SAutocompleteSelect';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import { SCopyIcon } from 'assets/icons/SCopyIcon';

import { get15Time } from 'core/utils/helpers/times';
import { timeMask } from 'core/utils/masks/date.mask';
import { sortNumber } from 'core/utils/sorts/number.sort';

const weekDays = [2, 3, 4, 5, 6, 7, 1];
const weekDaysPt = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

interface IShiftTimeSelectProps extends Omit<BoxProps, 'onChange'> {
  defaultSchedule?: Record<string, string>;
  onChange: (newSchedule: Record<string, string>) => void;
}

export const ShiftTimeSelect = ({
  defaultSchedule,
  onChange,
  ...props
}: IShiftTimeSelectProps) => {
  const [schedule, setSchedule] = useState<Record<string, string>>(
    defaultSchedule || {
      '2-0': '',
      '3-0': '',
      '4-0': '',
      '5-0': '',
      '6-0': '',
      '7-0': '',
      '1-0': '',
    },
  );

  const onChangeSchedule = (v: string, weekDay: number, key: string) => {
    setSchedule((old) => {
      const splitKey = key.split('-');
      const last = Number(splitKey[splitKey.length - 1]);

      if (v.length < 5) {
        Object.keys(old).forEach((k) => {
          const splitObjectKey = k.split('-');

          if (
            splitObjectKey[0] == String(weekDay) &&
            Number(splitObjectKey[1]) > last
          )
            delete old[k];
        });
      }

      const newData = {
        ...old,
        [key]: timeMask.mask(v),
        ...(v.length >= 5 ? { [`${weekDay}-${last + 1}`]: '' } : {}),
      };
      onChange?.(newData);

      return newData;
    });
  };

  const onCopyAll = () => {
    const keys = Object.keys(schedule);
    const newSchedule = {} as Record<string, string>;

    keys.forEach((key) => {
      if (key.includes('2-')) {
        [2, 3, 4, 5, 6].forEach((weekDay) => {
          newSchedule[weekDay + key.substring(1)] = schedule[key];
        });
        newSchedule['1-0'] = '';
        newSchedule['7-0'] = '';
      }
    });

    onChange?.(newSchedule);
    setSchedule(newSchedule);
  };

  return (
    <Box {...props}>
      <SFlex align="center">
        <STagButton
          onClick={onCopyAll}
          text={'copiar'}
          icon={SCopyIcon}
          showOnHover
          width={'100px'}
          mb={5}
        />
        {props.children}
      </SFlex>
      <SFlex>
        {weekDays.map((weekDay, index) => {
          return (
            <SFlex key={weekDay} flex={1} direction="column" gap={1}>
              <SText color="text.label" mb={5} fontSize={14}>
                {weekDaysPt[index]}
              </SText>
              {Object.entries(schedule)
                .sort(([a], [b]) =>
                  sortNumber(Number(onlyNumbers(a)), Number(onlyNumbers(b))),
                )
                ?.map(([key, value]) => {
                  const splitKey = key.split('-');
                  let startHour = 6;
                  let startMin = 0;

                  const lastKey = `${splitKey[0]}-${Number(splitKey[1]) - 1}`;
                  const lastValue = schedule[lastKey];

                  if (lastValue) {
                    const splitLastKey = lastValue.split(':');
                    startHour = Number(splitLastKey[0]);
                    startMin = Number(splitLastKey[1]) + 1;
                  }

                  if (splitKey[0] != String(weekDay)) return null;
                  const isNext =
                    Number(splitKey[1]) % 2 == 0 && Number(splitKey[1]) != 0;

                  return (
                    <Box key={key}>
                      <AutocompleteSelect
                        inputProps={{
                          labelPosition: 'top',
                          placeholder: '00:00',
                          superSmall: true,
                        }}
                        freeSolo
                        ListboxProps={{ sx: { fontSize: '14px' } } as any}
                        options={get15Time(startHour, startMin, 20, 0)}
                        onChange={(e, v) => {
                          onChangeSchedule(v || '', weekDay, key);
                        }}
                        sx={{ width: [90], mt: isNext ? 7 : 0 }}
                        name=""
                        label={''}
                        inputValue={value}
                        onInputChange={(e, v) => {
                          onChangeSchedule(v || '', weekDay, key);
                        }}
                      />
                    </Box>
                  );
                })}
            </SFlex>
          );
        })}
      </SFlex>
    </Box>
  );
};
