import { ArrowDropDown } from '@mui/icons-material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import {
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  TypographyProps,
} from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSelectButton, SSelectButtonProps } from './components/SSelectButton';
import { ReactNode, useRef } from 'react';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { SPopperMenuItem } from '@v2/components/organisms/SPopper/addons/SPopperMenuItem/SPopperMenuItem';
import { SPopperMenu } from '@v2/components/organisms/SPopper/addons/SPopperMenu/SPopperMenu';
import { SPopperSelect } from '@v2/components/organisms/SPopper/addons/SPopperSelect/SPopperSelect';
import { SPopperSelectItem } from '@v2/components/organisms/SPopper/addons/SPopperSelectItem/SPopperSelectItem';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SStartAddonCircle } from './addons/start-addons/SStartAddonCircle';
import { SStartAddonIcon } from './addons/start-addons/SStartAddonIcon';
import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt';
export interface SSelectButtonRowProps<T> {
  label: string;
  options: { label: string; value: T; startAddon?: ReactNode }[];
  onSelect: (value: T) => void;
  onClear?: () => void;
  schema?: SSelectButtonProps['schema'];
  minWidth?: number | number[];
}

export function SSelectButtonRow<T>({
  onSelect,
  options,
  label,
  schema,
  onClear,
  minWidth,
}: SSelectButtonRowProps<T>) {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure();

  const handleSelect = (value: T) => {
    onSelect(value);
    close();
  };

  return (
    <>
      <SSelectButton
        schema={schema}
        minWidth={minWidth}
        onClick={toggle}
        anchorEl={anchorEl}
        label={label}
      />
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={isOpen}
        close={close}
        color="paper"
      >
        <SPopperSelect>
          {options.map((option, index) => (
            <SPopperSelectItem
              key={option.label}
              startAddon={option.startAddon}
              text={option.label}
              onClick={() => handleSelect(option.value)}
            />
          ))}
          {onClear && (
            <>
              <SDivider />
              <SPopperSelectItem
                startAddon={
                  <SStartAddonIcon
                    item={<DoDisturbAltIcon sx={{ fontSize: 14 }} />}
                  />
                }
                text={'Limpar'}
                onClick={() => onClear()}
              />
            </>
          )}
        </SPopperSelect>
      </SPopperArrow>
    </>
  );
}
