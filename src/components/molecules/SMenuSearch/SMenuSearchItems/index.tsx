/* eslint-disable @typescript-eslint/no-empty-function */
import { FC, memo } from 'react';

import { Box, Checkbox } from '@mui/material';
import Icon from '@mui/material/Icon';
import STooltip from 'components/atoms/STooltip';

import SText from '../../../atoms/SText';
import { STMenuItem } from '../styles';
import { SMenuItemsSearchProps } from './types';

console.error = () => {};

const MenuItems: FC<SMenuItemsSearchProps> = ({
  handleMenuSelect,
  icon,
  startAdornment,
  multiple,
  options,
  optionsFieldName,
  localSelected,
  endAdornment,
}) => {
  const valueField =
    (optionsFieldName && optionsFieldName?.valueField) ?? 'value';
  const contentField =
    (optionsFieldName && optionsFieldName?.contentField) ?? 'name';
  return (
    <>
      {options.map((option) => {
        const value = option[valueField];
        const content = option[contentField];
        const checked =
          localSelected.current.find((id) => id == value) || option.checked;
        const optionIcon = option?.icon ? option.icon : icon;

        return (
          <STMenuItem
            key={value}
            className="checkbox-menu-item"
            onClick={(e) => {
              if (!multiple) handleMenuSelect(option, e);
              if (multiple) {
                const elementCheck = document.getElementById(value);
                if (elementCheck) elementCheck.click();
              }
            }}
          >
            {multiple && (
              <Box onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  id={value}
                  color={'secondary'}
                  defaultChecked={!!checked}
                  className="checkbox-menu-item"
                  sx={{ ml: -2 }}
                  onChange={(e) => {
                    if (e.target.checked)
                      localSelected.current = [...localSelected.current, value];
                    if (!e.target.checked)
                      localSelected.current = [
                        ...localSelected.current.filter((id) => id !== value),
                      ];
                  }}
                />
              </Box>
            )}
            {optionIcon && (
              <Icon
                sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
                component={optionIcon}
              />
            )}
            {startAdornment && startAdornment(option)}
            <STooltip
              minLength={100}
              placement="right-start"
              enterDelay={1200}
              title={content}
            >
              <Box width="100%">
                <SText fontSize={13} lineNumber={2}>
                  {content}
                </SText>
              </Box>
            </STooltip>
            {endAdornment && endAdornment(option)}
          </STMenuItem>
        );
      })}
    </>
  );
};

export const SMenuSearchItems = memo(MenuItems);
