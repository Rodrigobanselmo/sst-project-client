/* eslint-disable @typescript-eslint/no-empty-function */
import { FC, memo } from 'react';

import { Box, Checkbox } from '@mui/material';
import Icon from '@mui/material/Icon';
import { SInfoIcon } from 'assets/icons/SInfoIcon';
import STooltip from 'components/atoms/STooltip';

import { IdsEnum } from 'core/enums/ids.enums';

import SText from '../../../atoms/SText';
import { STMenuItem } from '../styles';
import { SMenuItemsSearchProps } from './types';

console.error = () => {};

const MenuItems: FC<{ children?: any } & SMenuItemsSearchProps> = ({
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
  handleMultiSelectMenu,
  renderContent,
  preserveOptionOrder,
}) => {
  const valueField =
    (optionsFieldName && optionsFieldName?.valueField) ?? 'value';
  const contentField =
    (optionsFieldName && optionsFieldName?.contentField) ?? 'name';

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
            aria-disabled={option.locked ? true : undefined}
            sx={{
              ...(option.locked
                ? {
                    opacity: 0.72,
                    cursor: 'default',
                    pointerEvents: 'auto',
                  }
                : {}),
              ...(option.lockedLabel
                ? { whiteSpace: 'normal', overflow: 'hidden' }
                : {}),
            }}
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
              if (option.locked) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              if (!multiple) handleMenuSelect(option, e);
              if (multiple) {
                const elementCheck = document.getElementById(
                  IdsEnum.MENU_ITEM_CHECKBOX_ID.replace(':id', String(value)),
                ) as HTMLInputElement;

                if (
                  !preserveOptionOrder &&
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
                {option.locked ? (
                  <Checkbox
                    id={IdsEnum.MENU_ITEM_CHECKBOX_ID.replace(
                      ':id',
                      String(value),
                    )}
                    color={'secondary'}
                    checked
                    disabled
                    className="checkbox-menu-item"
                    sx={{ ml: -2 }}
                  />
                ) : (
                  <Checkbox
                    id={IdsEnum.MENU_ITEM_CHECKBOX_ID.replace(
                      ':id',
                      String(value),
                    )}
                    color={'secondary'}
                    defaultChecked={!!checked}
                    className="checkbox-menu-item"
                    sx={{ ml: -2 }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const element = document.getElementById(
                          IdsEnum.MENU_ITEM_ID.replace(':id', String(index)),
                        ) as HTMLElement;

                        if (
                          !preserveOptionOrder &&
                          listRef &&
                          listRef.current &&
                          element
                        )
                          listRef.current.prepend(element);

                        localSelected.current = [
                          ...localSelected.current,
                          value,
                        ];
                      }
                      if (!e.target.checked)
                        localSelected.current = [
                          ...localSelected.current.filter((id) => id !== value),
                        ];

                      handleMultiSelectMenu?.(
                        option,
                        localSelected.current,
                        e,
                      );
                    }}
                  />
                )}
              </Box>
            )}
            {optionIcon && (
              <Icon
                sx={{ color: 'text.light', fontSize: '18px', mr: '10px' }}
                component={optionIcon}
              />
            )}
            {startAdornment && startAdornment(option)}
            <Box
              sx={
                option.lockedLabel
                  ? {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      minWidth: 0,
                      flex: '1 1 auto',
                      overflow: 'hidden',
                    }
                  : { width: '100%' }
              }
            >
              <STooltip
                minLength={100}
                placement="right-start"
                enterDelay={1200}
                title={content}
              >
                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    overflow: 'hidden',
                    ...(option.lockedLabel
                      ? { whiteSpace: 'normal' }
                      : { width: '100%' }),
                  }}
                >
                  {renderContent ? (
                    renderContent(option)
                  ) : (
                    <SText fontSize={13} lineNumber={2}>
                      {content}
                    </SText>
                  )}
                  {option.locked && !option.lockedLabel && (
                    <SText
                      fontSize={11}
                      sx={{ color: 'text.light', mt: 0.25, display: 'block' }}
                    >
                      já adicionado
                    </SText>
                  )}
                </Box>
              </STooltip>
              {option.locked && option.lockedLabel ? (
                <STooltip
                  title={option.lockedLabel}
                  placement="top"
                  enterDelay={300}
                  PopperProps={{
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: 'viewport',
                          altAxis: true,
                          padding: 8,
                        },
                      },
                      {
                        name: 'flip',
                        options: {
                          fallbackPlacements: ['bottom', 'left', 'right'],
                        },
                      },
                    ],
                  }}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        maxWidth: 280,
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                      },
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      flexShrink: 0,
                      lineHeight: 0,
                    }}
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Icon
                      component={SInfoIcon}
                      sx={{ fontSize: 16, color: 'info.main' }}
                    />
                  </Box>
                </STooltip>
              ) : null}
            </Box>
            {endAdornment && endAdornment(option)}
          </STMenuItem>
        );
      })}
    </>
  );
};

export const SMenuSearchItems = memo(MenuItems);
