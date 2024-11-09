import { FC } from 'react';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SDatePicker } from '@v2/components/forms/SDatePicker/SDatePicker';
import { SDatePickerRowProps } from './SDatePickerRow.types';
import { dateUtils } from '@v2/utils/date-utils';
import { SText } from '@v2/components/atoms/SText/SText';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';
import { SIconAdd } from '@v2/assets/icons/SIconAdd/SIconAdd';
import { SIconDate } from '@v2/assets/icons/SIconDate/SIconAdd';

{
  /* <SFlex center>
{date && (
  <SText>
    {date ? dateUtils(date).format('DD [de] MMMM YYYY') : emptyDate}
  </SText>
)}
{!date && <SText>{emptyDate || '-'}</SText>}
</SFlex> */
}

export const SDatePickerRow: FC<SDatePickerRowProps> = ({
  date,
  onChange,
  onClear,
  emptyDate,
}) => {
  return (
    <SDatePicker
      selected={date || undefined}
      onClear={onClear}
      onChange={(date) => {
        if (date) onChange(date);
      }}
      customInput={
        <SEditButtonRow
          onClick={(e) => {}}
          label={
            date
              ? dateUtils(date).format('DD [de] MMMM YYYY')
              : emptyDate || '-'
          }
          textProps={{
            sx: {
              filter: 'brightness(0.5)',
            },
          }}
          boxProps={{
            width: '100%',
          }}
          icon={<SIconDate fontSize={12} color={'text.main'} />}
        />
      }
    />
  );
};
