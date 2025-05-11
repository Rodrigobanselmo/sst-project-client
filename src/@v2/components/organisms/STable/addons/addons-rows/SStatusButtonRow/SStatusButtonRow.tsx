import STooltip from '@v2/components/atoms/STooltip/STooltip';
import {
  SPopperStatus,
  SPopperStatusProps,
} from '@v2/components/organisms/SPopper/addons/SPopperStatus/SPopperStatus';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';

export interface SStatusButtonRowProps {
  popperStatusProps: Omit<SPopperStatusProps, 'children'>;
  color?: string;
  label: string;
}

export function SStatusButtonRow({
  label,
  color,
  popperStatusProps,
}: SStatusButtonRowProps) {
  return (
    <SPopperStatus {...popperStatusProps}>
      <STooltip title={label} placement="left" withWrapper minLength={15}>
        <SEditButtonRow
          label={label}
          color={color}
          textProps={{
            sx: {
              filter: 'brightness(0.5)',
            },
          }}
          boxProps={{
            width: '100%',
            sx: {
              ...(color && {
                backgroundColor: color + '33',
                borderColor: color,
              }),
            },
          }}
        />
      </STooltip>
    </SPopperStatus>
  );
}
