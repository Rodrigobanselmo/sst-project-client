import ColorIcon from '@mui/icons-material/OpacityOutlined';
import { Box } from '@mui/material';
import { SIconClose } from '@v2/assets/icons/SIconClose/SIconClose';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { useRef } from 'react';
import { ColorPickerList } from './ColorPickerList';

export interface PopperColorPickerProps {
  onSelect: (value: string | null) => void;
}

export function PopperColorPicker({ onSelect }: PopperColorPickerProps) {
  const state = useDisclosure();
  const anchorEl = useRef<null | HTMLDivElement>(null);

  const handleSelect = (value: string | null) => {
    state.close();
    onSelect(value);
  };

  return (
    <>
      <Box ref={anchorEl}>
        <SIconButton
          onClick={state.open}
          iconButtonProps={{
            sx: {
              width: 25,
              height: 25,
            },
          }}
        >
          <ColorIcon sx={{ fontSize: 16 }} />
        </SIconButton>
      </Box>
      <SPopperArrow
        disabledArrow
        placement="bottom-start"
        anchorEl={anchorEl}
        isOpen={state.isOpen}
        close={state.close}
        color="paper"
        sx={{
          transform: 'translateY(10px)',
        }}
      >
        <Box width={243} py={3} pb={8} px={8}>
          <SFlex align="center" justify="space-between" mb={4}>
            <SText color="text.light">Cor</SText>
            <SIconButton size="small" onClick={state.close}>
              <SIconClose fontSize={17} color="text.priamry" />
            </SIconButton>
          </SFlex>
          <ColorPickerList onSelectedColor={handleSelect} />
        </Box>
      </SPopperArrow>
    </>
  );
}
