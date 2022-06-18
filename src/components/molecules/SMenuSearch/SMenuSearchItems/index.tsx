/* eslint-disable @typescript-eslint/no-empty-function */
import { FC, memo } from 'react';

import { Box, Checkbox } from '@mui/material';
import Icon from '@mui/material/Icon';
import STooltip from 'components/atoms/STooltip';

import { IdsEnum } from 'core/enums/ids.enums';

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
  setScroll,
  optionsFieldName,
  localSelected,
  endAdornment,
  listRef,
}) => {
  const valueField =
    (optionsFieldName && optionsFieldName?.valueField) ?? 'value';
  const contentField =
    (optionsFieldName && optionsFieldName?.contentField) ?? 'name';

  console.log(options);

  return (
    <>
      {options.map((option, index, arr) => {
        const value = option[valueField];
        const content = option[contentField];
        const checked =
          localSelected.current.find((id) => id == value) || option.checked;
        const optionIcon = option?.icon ? option.icon : icon;

        return (
          <STMenuItem
            key={value}
            id={IdsEnum.MENU_ITEM_ID.replace(':id', String(index))}
            className="checkbox-menu-item"
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' && index === 0) {
                const input = document.getElementById(
                  IdsEnum.INPUT_MENU_SEARCH,
                );
                if (input) {
                  input.focus();
                  e.stopPropagation();
                }
              }
              if (e.key === 'ArrowDown') {
                if (index === arr.length - 2)
                  setScroll && setScroll((scroll) => scroll + 1);
                if (index === arr.length - 1) {
                  const input = document.getElementById(
                    IdsEnum.INPUT_MENU_SEARCH,
                  );
                  if (input) {
                    input.focus();
                    e.stopPropagation();
                  }
                }
              }
            }}
            onClick={(e) => {
              if (!multiple) handleMenuSelect(option, e);
              if (multiple) {
                const elementCheck = document.getElementById(
                  value,
                ) as HTMLInputElement;

                console.log(listRef);
                if (
                  listRef &&
                  listRef.current &&
                  elementCheck &&
                  !elementCheck?.checked
                )
                  listRef.current.prepend(e.currentTarget);
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
                    if (e.target.checked) {
                      const element = document.getElementById(
                        IdsEnum.MENU_ITEM_ID.replace(':id', String(index)),
                      ) as HTMLElement;

                      if (listRef && listRef.current && element)
                        listRef.current.prepend(element);

                      localSelected.current = [...localSelected.current, value];
                    }
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
