import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Input, InputAdornment } from '@mui/material';
import { SIconSearch } from '@v2/assets/icons/SIconSearch/SIconSearch';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPopperSelect } from '@v2/components/organisms/SPopper/addons/SPopperSelect/SPopperSelect';
import { SPopperSelectItem } from '@v2/components/organisms/SPopper/addons/SPopperSelectItem/SPopperSelectItem';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { useSearch } from '@v2/hooks/useSearch';
import deepEqual from 'deep-equal';
import { ReactNode, useLayoutEffect, useRef } from 'react';

interface PopperSelectBaseProps<Value> {
  children: ReactNode;
  getOptionLabel: (option: Value) => string;
  getOptionValue: (option: Value) => string | number | boolean;
  renderOption?: (args: {
    option: Value;
    label: string;
    isSelected: boolean;
    handleSelect: (e: any) => void;
  }) => ReactNode;
  onClean?: (event: React.SyntheticEvent) => void;
  onClose?: () => void;
  selected: Value[];
  closeOnSelect?: boolean;
}

interface PopperSelectSingleProps<Value> {
  options: Value[];
  onChange: (value: Value, event: React.SyntheticEvent) => void;
}

interface PopperManySingleProps<Value> {
  options: Value[];
  onChange: (value: Value, event: React.SyntheticEvent) => void;
}

export type PopperSelectProps<Value> = PopperSelectBaseProps<Value> &
  (PopperSelectSingleProps<Value> | PopperManySingleProps<Value>);

export function PopperSelect<T>({
  options,
  children,
  selected,
  closeOnSelect = true,
  onChange,
  onClean,
  getOptionValue,
  getOptionLabel,
  onClose,
  renderOption,
}: PopperSelectProps<T>) {
  const selectSate = useDisclosure();
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, onSearch, search } = useSearch({
    data: options.map((option) => ({ label: getOptionLabel(option), option })),
    keys: ['label'],
    threshold: 0,
  });

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
      <div ref={anchorEl} onClick={(e) => selectSate.open()}>
        {children}
      </div>
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={selectSate.isOpen}
        close={handleClose}
        color="paper"
      >
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
          >
            <SPopperSelect autoFocus={false}>
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
                          sx={{ width: 16, height: 16 }}
                          onClick={(e) => {
                            if (inputRef.current) inputRef.current.value = '';
                            onSearch('');
                          }}
                        >
                          <CloseIcon
                            sx={{ color: 'text.light', fontSize: 12 }}
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
              <Box height={44} />
              {results.map(({ option, label }) => {
                const isSelected = selected.some(
                  (value) => getOptionValue(value) === getOptionValue(option),
                );

                if (renderOption) {
                  return renderOption({
                    option,
                    label,
                    isSelected,
                    handleSelect: (e) => handleSelect(option, e),
                  });
                }

                return (
                  <SPopperSelectItem
                    key={label}
                    text={label}
                    selected={isSelected}
                    onClick={(e) => handleSelect(option, e)}
                  />
                );
              })}
            </SPopperSelect>
          </SFlex>
          {onClean && (
            <>
              <SDivider sx={{ mb: 3 }} />
              <SFlex px={4} pb={4}>
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
              </SFlex>
            </>
          )}
        </SFlex>
      </SPopperArrow>
    </Box>
  );
}
