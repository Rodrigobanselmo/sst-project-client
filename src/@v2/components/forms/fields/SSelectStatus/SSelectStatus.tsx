import { ArrowDropDown } from '@mui/icons-material';
import {
  IPopperStatusValue,
  SPopperStatus,
  SPopperStatusProps,
} from '@v2/components/organisms/SPopper/addons/SPopperStatus/SPopperStatus';
import { SInput } from '../SInput/SInput';
import { SInputProps } from '../SInput/SInput.types';
import CircleIcon from '@mui/icons-material/Circle';

export interface SSelectStatusProps {
  value: IPopperStatusValue | null;
  onChange: (id: number | null, item: IPopperStatusValue) => void;
  errorMessage?: string;
  label?: string;
  placeholder?: string;
  component?: (() => JSX.Element) | React.ElementType;
  inputProps?: Partial<SInputProps>;
  popperStatusProps: Omit<SPopperStatusProps, 'children' | 'onSelect'>;
  endAdornment?: React.ReactNode;
  startAdornment?: React.ReactNode;
}

export const SSelectStatus = ({
  onChange,
  errorMessage,
  value,
  label,
  component: Component,
  inputProps,
  popperStatusProps,
  placeholder,
  startAdornment = (
    <CircleIcon
      sx={{ fontSize: 15, color: value?.color || 'grey.500', mr: 4 }}
    />
  ),
  endAdornment = <ArrowDropDown sx={{ fontSize: 15, color: 'text.main' }} />,
}: SSelectStatusProps) => {
  return (
    <SPopperStatus {...popperStatusProps} onSelect={onChange}>
      {Component && <Component />}
      {!Component && (
        <SInput
          fullWidth
          {...inputProps}
          label={label}
          error={!!errorMessage}
          value={value?.name || ''}
          helperText={errorMessage}
          placeholder={placeholder}
          startAdornment={!value?.name ? null : startAdornment}
          endAdornment={endAdornment}
          sx={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            ...inputProps?.sx,
          }}
        />
      )}
    </SPopperStatus>
  );
};
