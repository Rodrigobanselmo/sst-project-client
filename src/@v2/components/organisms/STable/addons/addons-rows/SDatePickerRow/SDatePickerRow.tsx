import { FC } from 'react';

import { SIconDate } from '@v2/assets/icons/SIconDate/SIconAdd';
import { SDatePicker } from '@v2/components/forms/fields/SDatePicker/SDatePicker';
import { dateUtils } from '@v2/utils/date-utils';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';
import { SDatePickerRowProps } from './SDatePickerRow.types';
import { SDatePickerPopper } from '@v2/components/forms/fields/SDatePicker/SDatePickerPopper';

export const SDatePickerRow: FC<SDatePickerRowProps> = ({
  date,
  onChange,
  onClear,
  emptyDate,
  loading,
}) => {
  return (
    <SDatePickerPopper
      value={date || undefined}
      onClear={onClear}
      onChange={(date) => {
        if (date) onChange(date);
      }}
    >
      <SEditButtonRow
        loading={loading}
        onClick={() => null}
        label={
          date ? dateUtils(date).format('DD [de] MMMM YYYY') : emptyDate || '-'
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
    </SDatePickerPopper>
  );
};
