/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, MouseEvent } from 'react';

import { Box } from '@mui/material';
import Icon from '@mui/material/Icon';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { STMenu, STMenuItem } from './styles';
import { SMenuProps, IMenuOptionResponse } from './types';

export const SMenu: FC<SMenuProps> = ({
  isOpen,
  close,
  anchorEl,
  handleSelect,
  options,
  icon,
  startAdornment,
  tooltipProps = () => null,
  ...props
}) => {
  const handleMenuSelect = (
    option: IMenuOptionResponse,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    if (isOpen) close();
    handleSelect(option, e);
  };

  const onClose = (e: any) => {
    e.stopPropagation();
    close();
  };

  return (
    <STMenu
      anchorEl={anchorEl}
      open={isOpen}
      onClose={(e) => onClose(e)}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {options.map((option) => (
        <STMenuItem
          disabled={option?.disabled}
          key={option.value}
          onClick={(e) => handleMenuSelect(option, e)}
          sx={{
            p: 0,
            m: 0,
            ...(option.borderTop && {
              borderTop:
                typeof option.borderTop === 'string'
                  ? option.borderTop
                  : '1px solid #e0e0e0',
            }),
          }}
        >
          {option && (icon || option.icon) && (
            <Icon
              sx={{
                color: option?.iconColor ?? 'text.light',
                fontSize: '18px',
                mr: '5px',
              }}
              component={option.icon ? option.icon : (icon as any)}
            />
          )}
          {startAdornment && startAdornment(option)}
          <STooltip
            minLength={100}
            placement="right-start"
            enterDelay={1200}
            title={option.name}
            {...tooltipProps(option)}
          >
            <Box width="100%" overflow="hidden">
              <SText
                className="noBreakText"
                fontSize={13}
                color={option?.color}
              >
                {option.name}
              </SText>
            </Box>
          </STooltip>
        </STMenuItem>
      ))}
    </STMenu>
  );
};
