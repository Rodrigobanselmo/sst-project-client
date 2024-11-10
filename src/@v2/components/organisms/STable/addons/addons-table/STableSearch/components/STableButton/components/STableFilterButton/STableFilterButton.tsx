import { Children, FC, useRef } from 'react';

import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

import { STableButton } from '../../STableButton';
import { STableFilterButtonProps } from './STableFilterButton.types';
import { Box } from '@mui/material';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SIconFilter } from '@v2/assets/icons/SIconFilter/SIconFilter';

export const STableFilterButton: FC<STableFilterButtonProps> = ({
  onClick,
  text,
  children,
  popperTile = 'Aplicar filtros',
}) => {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure();

  const handleSelect = () => {
    toggle();
    onClick?.();
  };

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Box ref={anchorEl}>
        <STableButton
          onClick={handleSelect}
          text={text ?? 'Fitros'}
          icon={<SIconFilter fontSize={16} />}
        />
      </Box>
      <SPopperArrow
        disabledArrow
        placement="bottom-end"
        anchorEl={anchorEl}
        isOpen={isOpen}
        close={close}
        color="paper"
      >
        {popperTile && (
          <SFlex align="center" mb={3} px={5} pt={5}>
            <SIconFilter color="text.light" fontSize="18px" />
            <SText color={'text.light'}>{popperTile}</SText>
          </SFlex>
        )}
        <SDivider sx={{ mb: 6 }} />
        <SFlex
          px={5}
          pb={5}
          direction={'column'}
          minWidth={300}
          minHeight={200}
        >
          {children}
        </SFlex>
      </SPopperArrow>
    </Box>
  );
};
