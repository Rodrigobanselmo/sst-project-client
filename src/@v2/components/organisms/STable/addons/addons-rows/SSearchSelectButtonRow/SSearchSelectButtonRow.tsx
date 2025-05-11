import { Box } from '@mui/material';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';

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
      boxProps={{ onClick: (e) => e.stopPropagation() }}
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
