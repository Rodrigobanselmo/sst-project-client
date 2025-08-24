import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  Input,
  InputAdornment,
  MenuItemProps,
} from '@mui/material';
import { SIconSearch } from '@v2/assets/icons/SIconSearch/SIconSearch';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPopperSelect } from '@v2/components/organisms/SPopper/addons/SPopperSelect/SPopperSelect';
import { SPopperSelectItem } from '@v2/components/organisms/SPopper/addons/SPopperSelectItem/SPopperSelectItem';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { memo, ReactNode, useEffect, useRef } from 'react';

export interface PopperSelectBaseProps<Value> {
  children: ReactNode;
  disabled?: boolean;
  startCompoent?: ReactNode;
  hideSearchInput?: boolean;
  getOptionLabel: (option: Value) => ReactNode | string;
  getOptionValue: (option: Value) => string | number | boolean;
  getOptionIsDisabled?: (option: Value) => boolean;
  renderItem?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
  }) => ReactNode;
  renderFullOption?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
    handleSelect: (e: any) => void;
  }) => ReactNode;
  onClean?: (event: React.SyntheticEvent) => void;
  onClose?: () => void;
  onScrollEnd?: () => void;
  selected: Value[];
  closeOnSelect?: boolean;
  loading?: boolean;
  popperItemProps?: MenuItemProps;
}

interface PopperSelectSearchProps {
  onSearch: (value: string) => void;
  search: string;
}

interface PopperSelectSingleProps<Value> {
  options: {
    label: ReactNode;
    option: Value;
  }[];
  onChange: (value: Value, event: React.SyntheticEvent) => void;
}

interface PopperManySingleProps<Value> {
  options: {
    label: string;
    option: Value;
  }[];
  onChange: (value: Value, event: React.SyntheticEvent) => void;
}

export type PopperSelectProps<Value> = PopperSelectBaseProps<Value> &
  PopperSelectSearchProps &
  (PopperSelectSingleProps<Value> | PopperManySingleProps<Value>);

export function PopperSelectComponent<T>({
  options,
  children,
  selected,
  closeOnSelect = true,
  onChange,
  onClean,
  getOptionValue,
  onSearch,
  search,
  onClose,
  renderItem,
  renderFullOption,
  loading,
  onScrollEnd,
  startCompoent,
  popperItemProps,
  disabled,
  hideSearchInput,
  getOptionIsDisabled,
}: PopperSelectProps<T>) {
  const selectSate = useDisclosure();
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    onClose?.();
    selectSate.close();
    onSearch('');
  };

  const handleSelect = (value: T, e: any) => {
    onChange(value, e);
    if (closeOnSelect) handleClose();
  };

  const handleClean = (e: any) => {
    onClean?.(e);
    handleClose();
  };

  const handleScroll = () => {
    const scrollableDiv = scrollRef.current;

    if (scrollableDiv) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableDiv;

      if (Math.ceil(scrollTop + clientHeight) >= scrollHeight) {
        onScrollEnd?.();
      }
    }
  };

  return (
    <Box
      sx={{
        '& .close-icon': { display: 'none' },
        '&:hover': {
          '& .close-icon': { display: 'flex' },
          fieldset: {
            border: '2px solid',
            borderColor: 'primary.main',
            outline: 'none',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: '1px solid',
            borderColor: 'primary.main',
            outline: 'none',
          },
        },
        caretColor: 'transparent',
        ...(selectSate.isOpen && {
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              border: '2px solid',
              borderColor: 'primary.main',
              outline: 'none',
            },
          },
          fieldset: {
            border: '1px solid',
            borderColor: 'primary.main',
          },
        }),
      }}
    >
      <div
        ref={anchorEl}
        onClick={(e) => (disabled ? null : selectSate.open())}
      >
        {children}
      </div>
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={selectSate.isOpen}
        close={handleClose}
        color="paper"
        position="relative"
      >
        {startCompoent}
        <SFlex
          direction="column"
          minWidth={'fit-content'}
          width={anchorEl.current?.offsetWidth}
          gap={0}
          pt={2}
        >
          <SFlex
            pb={2}
            px={0}
            gap={0}
            direction="column"
            maxHeight={400}
            minWidth={200}
            overflow="auto"
            ref={scrollRef}
            onScroll={onScrollEnd ? handleScroll : undefined}
          >
            <SPopperSelect autoFocus={false}>
              {!hideSearchInput && (
                <Box
                  onKeyDown={(e) => {
                    if (e.key == 'ArrowUp') {
                      inputRef.current?.focus();
                      e.stopPropagation();
                    }
                  }}
                  sx={{
                    bgcolor: 'white',
                    zIndex: 1,
                    mt: -2,
                    outline: 'none',
                    width: '100%',
                    position: 'fixed',
                    ':focus': { hr: { borderColor: 'secondary.main' } },
                  }}
                >
                  <Input
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') handleClose();
                      if (e.key !== 'ArrowDown') e.stopPropagation();
                    }}
                    inputRef={inputRef}
                    disableUnderline
                    fullWidth
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="pesquisar..."
                    endAdornment={
                      search ? (
                        <InputAdornment position="end">
                          <IconButton
                            sx={{ width: 20, height: 20 }}
                            onClick={(e) => {
                              if (inputRef.current) inputRef.current.value = '';
                              onSearch('');
                            }}
                          >
                            <CloseIcon
                              sx={{ color: 'text.light', fontSize: 15 }}
                            />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }
                    startAdornment={
                      <InputAdornment position="start">
                        <SIconSearch color="text.light" fontSize={16} />
                      </InputAdornment>
                    }
                    sx={{
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      lineHeight: '16px',
                      mt: 1,
                      padding: '1px 10px 1px 12px',
                      marginBottom: '4px',
                    }}
                  />
                  <SDivider />
                </Box>
              )}
              {!hideSearchInput && <Box height={44} />}
              {options.map(({ option, label }, index) => {
                const optionValue = getOptionValue(option);

                const isSelected = selected.some(
                  (value) => getOptionValue(value) === optionValue,
                );

                const isDisabled = getOptionIsDisabled?.(option);

                if (renderFullOption) {
                  return renderFullOption({
                    option,
                    label,
                    isSelected,
                    handleSelect: (e) => handleSelect(option, e),
                  });
                }

                return (
                  <SPopperSelectItem
                    autoFocus={hideSearchInput}
                    rerender={selected.length + (isSelected ? 1 : 0)}
                    key={`${label}-${optionValue}`}
                    text={renderItem ? undefined : label}
                    selected={isSelected}
                    onClick={(e) => handleSelect(option, e)}
                    compoent={renderItem?.({ option, label, isSelected })}
                    itemProps={popperItemProps}
                    disabled={isDisabled}
                  />
                );
              })}
              {loading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <SSkeleton key={index} height={35} sx={{ mx: 4, mb: 2 }} />
                ))}
            </SPopperSelect>
          </SFlex>
          {(onClean || closeOnSelect) && (
            <>
              <SDivider sx={{ mb: 3 }} />
              <SFlex px={4} pb={4}>
                {onClean && (
                  <SText
                    color={'text.secondary'}
                    onClick={(e) => handleClean(e)}
                    sx={{
                      fontSize: '12px',
                      fontWeight: 400,
                      ml: 'auto',
                      pt: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      '&:active': {
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    Limpar
                  </SText>
                )}
                {!closeOnSelect && (
                  <SText
                    color={'primary.main'}
                    onClick={() => handleClose()}
                    sx={{
                      fontSize: '12px',
                      fontWeight: 400,
                      ml: onClean ? '16px' : 'auto',
                      pt: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                      '&:active': {
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    Confirmar
                  </SText>
                )}
              </SFlex>
            </>
          )}
        </SFlex>
      </SPopperArrow>
    </Box>
  );
}

// const genericMemo: <T>(component: T, any) => T = memo;
// export const PopperSelectComponent = genericMemo(
//   SPopperSelectComponent,
//   (prevProps, nextProps) => {
//     return true;
//   },
// );
