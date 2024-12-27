import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { SPopperSelect } from '@v2/components/organisms/SPopper/addons/SPopperSelect/SPopperSelect';
import { SPopperSelectItem } from '@v2/components/organisms/SPopper/addons/SPopperSelectItem/SPopperSelectItem';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { ReactNode, useRef } from 'react';
import { SStartAddonIcon } from './addons/start-addons/SStartAddonIcon';
import { SSelectButton, SSelectButtonProps } from './components/SSelectButton';
export interface SSelectButtonRowProps<T> {
  label: string;
  options: { label: string; value: T; startAddon?: ReactNode }[];
  onSelect: (value: T) => void;
  onClear?: () => void;
  schema?: SSelectButtonProps['schema'];
  minWidth?: number | number[] | string | string[];
  loading?: boolean;
}

export function SSelectButtonRow<T>({
  onSelect,
  options,
  label,
  schema,
  onClear,
  minWidth,
  loading,
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
        loading={loading}
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
