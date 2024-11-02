import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Input, InputAdornment } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
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
            border: '2px solid',
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
          minWidth={200}
          width={anchorEl.current?.offsetWidth}
          gap={0}
          pt={2}
        >
          <Input
            autoFocus
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
                    <CloseIcon sx={{ color: 'text.light', fontSize: 12 }} />
                  </IconButton>
                </InputAdornment>
              ) : null
            }
            sx={{
              border: 'none',
              outline: 'none',
              fontSize: '11px',
              lineHeight: '11px',
              padding: '0px 8px 0px 12px',
              marginBottom: '4px',
            }}
          />
          <SDivider />
          <SFlex
            mt={4}
            pb={4}
            px={renderOption ? 0 : 4}
            gap={renderOption ? 0 : 2}
            direction="column"
            maxHeight={400}
            overflow="auto"
          >
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
                <SFlex
                  center
                  key={label}
                  onClick={(e) => handleSelect(option, e)}
                  sx={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'grey.300',
                    color: 'white',
                    backgroundColor: isSelected ? 'mainBlur.10' : 'grey.100',
                    padding: '4px 8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    width: '100%',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      filter: 'brightness(0.95)',
                    },
                    '&:active': {
                      filter: 'brightness(0.9)',
                    },
                  }}
                >
                  <SText
                    lineNumber={1}
                    textAlign={'center'}
                    sx={{
                      fontSize: '13px',
                      fontWeight: 400,
                      color: isSelected ? 'primary.dark' : 'text.primary',
                    }}
                  >
                    {label}
                  </SText>
                </SFlex>
              );
            })}
            {onClean && (
              <SText
                color={'text.secondary'}
                onClick={(e) => handleClean(e)}
                sx={{
                  fontSize: '10px',
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
          </SFlex>
        </SFlex>
      </SPopperArrow>
    </Box>
  );
}
