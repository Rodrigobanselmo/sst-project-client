import { Box, Input } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { useSearch } from '@v2/hooks/useSearch';
import { contrastColor } from 'contrast-color';
import { useRef } from 'react';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';

export interface SUserButtonRowProps {
  options: { name: string; id: number }[];
  label: string;
  onSelect: (id: number | null) => void;
}

export function SUserButtonRow({
  options,
  label,
  onSelect,
}: SUserButtonRowProps) {
  return (
    <SSearchSelect
      label="Status"
      value={{ id: 1, name: 'Rodrigo Barbosa Anselmo' }}
      getOptionLabel={(option) => option?.name}
      getOptionValue={(option) => option?.id}
      onChange={(option) => console.log(option)}
      onInputChange={(value) => console.log(value)}
      placeholder="selecione um ou mais status"
      options={options}
      component={() => (
        <Box>
          <STooltip title={label} placement="left" withWrapper minLength={15}>
            <SEditButtonRow
              onClick={(e) => {}}
              label={label}
              textProps={{
                sx: {
                  filter: 'brightness(0.5)',
                },
              }}
              boxProps={{
                width: '100%',
              }}
            />
          </STooltip>
        </Box>
      )}
    />
  );
}
