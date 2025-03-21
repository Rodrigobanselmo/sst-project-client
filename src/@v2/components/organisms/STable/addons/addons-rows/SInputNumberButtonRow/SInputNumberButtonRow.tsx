import { Box } from '@mui/material';
import { SInput } from '@v2/components/forms/fields/SInput/SInput';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { useRef } from 'react';
import { SEditButtonRow } from '../SEditButtonRow/SEditButtonRow';
import { STableButton } from '../../addons-table/STableSearch/components/STableButton/STableButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SButton } from '@v2/components/atoms/SButton/SButton';

export interface SInputNumberButtonRowProps {
  label: string;
  onSelect: (value: number | null) => void;
}

export function SInputNumberButtonRow({
  onSelect,
  label,
}: SInputNumberButtonRowProps) {
  const inputRef = useRef<any>(null);
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure();

  const handleSelect = (value: string) => {
    const isNumber = value && !isNaN(Number(value));

    onSelect(isNumber ? Number(value) : null);
    close();
  };

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <SEditButtonRow
        onClick={toggle}
        anchorEl={anchorEl}
        boxProps={{ minWidth: '50px' }}
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
        <SFlex px={5} py={5} gap={4}>
          <SInput
            inputRef={inputRef}
            autoFocus
            placeholder="Posição"
            size="sm"
            type="number"
            sx={{ width: '100px' }}
          />
          <SButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSelect(inputRef.current.value);
            }}
            text={'Salvar'}
            color="primary"
          />
        </SFlex>
      </SPopperArrow>
    </Box>
  );
}
