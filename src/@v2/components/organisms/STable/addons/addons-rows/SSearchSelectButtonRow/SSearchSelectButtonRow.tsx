import { Box, Input } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { useSearch } from '@v2/hooks/useSearch';
import { contrastColor } from 'contrast-color';
import { useRef } from 'react';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';

export interface SSearchSelectButtonRowProps<T> {
  options: T[];
  loading?: boolean;
  label: string;
  onSelect: (option: T | null) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string | number | boolean;
  onSearch?: (value: string) => void;
  disabled?: boolean;
}

export function SSearchSelectButtonRow<T>({
  options,
  label,
  getOptionLabel,
  getOptionValue,
  onSelect,
  loading,
  onSearch,
  disabled,
}: SSearchSelectButtonRowProps<T>) {
  return (
    <SSearchSelect
      disabled={disabled}
      loading={loading}
      getOptionLabel={getOptionLabel}
      getOptionValue={getOptionValue}
      onSearch={onSearch}
      onChange={(option) => onSelect(option)}
      options={options}
      component={() => (
        <Box>
          <STooltip title={label} placement="left" withWrapper minLength={15}>
            <SEditButtonRow
              onClick={(e) => {}}
              disabled={disabled}
              loading={loading}
              label={label}
              textProps={{
                sx: {
                  filter: 'brightness(0.5)',
                },
              }}
              boxProps={{
                width: '100%',
              }}
            />
          </STooltip>
        </Box>
      )}
    />
  );
}
