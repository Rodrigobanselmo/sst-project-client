import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';

import { Box, Typography } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { InputFormProps } from 'components/molecules/form/input/types';

const HEX_6 = /^#?([0-9a-fA-F]{6})$/;
const HEX_3 = /^#?([0-9a-fA-F]{3})$/;

function normalizeCssHex(raw: string): string | null {
  const value = raw.trim();
  const match6 = value.match(HEX_6);
  if (match6) return `#${match6[1].toUpperCase()}`;

  const match3 = value.match(HEX_3);
  if (match3) {
    const [r, g, b] = match3[1];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return null;
}

function toNativeColorValue(raw: unknown): string {
  if (typeof raw !== 'string') return '#000000';
  const normalized = normalizeCssHex(raw);
  return normalized ? normalized.toLowerCase() : '#000000';
}

function toHexDisplay(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  return normalizeCssHex(raw) ?? raw;
}

type ColorHexInputFormProps = Pick<
  InputFormProps,
  'control' | 'name' | 'setValue' | 'defaultValue' | 'label' | 'helperText'
>;

export const ColorHexInputForm = ({
  control,
  name,
  setValue,
  defaultValue = '',
  label,
  helperText,
}: ColorHexInputFormProps) => {
  useEffect(() => {
    defaultValue && setValue?.(name, defaultValue);
  }, [defaultValue, name, setValue]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || ''}
      render={({
        field: { onBlur, onChange, value, ref },
        fieldState: { error },
      }) => (
        <ColorHexInputs
          label={label}
          helperText={(error?.message as string | undefined) ?? helperText}
          error={!!error}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          inputRef={ref}
        />
      )}
    />
  );
};

const ColorHexInputs = ({
  label,
  helperText,
  error,
  value,
  onChange,
  onBlur,
  inputRef,
}: {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error: boolean;
  value: unknown;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: React.Ref<HTMLInputElement>;
}) => {
  const [hexDraft, setHexDraft] = useState(() => toHexDisplay(value));

  useEffect(() => {
    const normalized =
      typeof value === 'string' ? normalizeCssHex(value) : null;
    if (normalized) setHexDraft(normalized);
  }, [value]);

  const fieldLabel = typeof label === 'string' ? label : 'Cor';

  return (
    <Box sx={{ minWidth: ['100%', 600] }}>
      {label && (
        <Typography
          component="label"
          fontSize={14}
          color={error ? 'error.main' : 'grey.600'}
          sx={{ display: 'block', mb: 2 }}
        >
          {label}
        </Typography>
      )}
      <SFlex gap={4} align="center">
        <SInput
          type="color"
          size="small"
          aria-label={fieldLabel}
          value={toNativeColorValue(value)}
          onChange={(e) => {
            const normalized = normalizeCssHex(e.target.value);
            if (normalized) onChange(normalized);
          }}
          sx={{
            width: 56,
            minWidth: 56,
            flexShrink: 0,
            '& .MuiOutlinedInput-root': {
              height: 40,
            },
            '& input': {
              cursor: 'pointer',
              height: '100%',
              p: 0.5,
            },
          }}
        />
        <Box flex={1} minWidth={0}>
          <SInput
            size="small"
            placeholder="#RRGGBB"
            value={hexDraft}
            error={error}
            inputRef={inputRef}
            aria-label={`${fieldLabel} HEX`}
            onChange={(e) => {
              const next = e.target.value;
              setHexDraft(next);
              const normalized = normalizeCssHex(next);
              if (normalized) onChange(normalized);
            }}
            onBlur={() => {
              const normalized = normalizeCssHex(hexDraft);
              if (normalized) {
                setHexDraft(normalized);
                onChange(normalized);
              } else {
                setHexDraft(toHexDisplay(value));
              }
              onBlur();
            }}
            sx={{ width: '100%' }}
          />
        </Box>
      </SFlex>
      {helperText ? (
        <Typography
          fontSize={12}
          color={error ? 'error.main' : 'text.label'}
          sx={{ display: 'block', mt: 1.5 }}
        >
          {helperText}
        </Typography>
      ) : null}
    </Box>
  );
};
