import { ArrowDropDown } from '@mui/icons-material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { IconButton, Paper, TypographyProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSelectButton } from './components/SSelectButton';
import { useRef } from 'react';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';
import { SPopperMenu } from '@v2/components/organisms/SPopper/addons/SPopperMenu/SPopperMenu';
import { SPopperSelect } from '@v2/components/organisms/SPopper/addons/SPopperSelect/SPopperSelect';
import { SPopperSelectItem } from '@v2/components/organisms/SPopper/addons/SPopperSelectItem/SPopperSelectItem';

export interface SSelectButtonRowProps<T> {
  label: string;
  options: { label: string; value: T }[];
  onSelect: (value: T) => void;
}

export function SSelectButtonRow<T>({
  onSelect,
  options,
  label,
}: SSelectButtonRowProps<T>) {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure();

  const handleSelect = (value: T) => {
    onSelect(value);
    close();
  };

  return (
    <>
      <SSelectButton onClick={toggle} anchorEl={anchorEl} label={label} />
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={isOpen}
        close={close}
        color="paper"
      >
        {options.map((option) => (
          <SPopperSelect key={option.label}>
            <SPopperSelectItem
              text={option.label}
              onClick={() => handleSelect(option.value)}
            />
          </SPopperSelect>
        ))}
      </SPopperArrow>
    </>
  );
}
