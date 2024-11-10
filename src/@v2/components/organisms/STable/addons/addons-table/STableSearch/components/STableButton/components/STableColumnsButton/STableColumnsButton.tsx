import { FC, useRef } from 'react';

import { Box } from '@mui/material';
import { SIconColumn } from '@v2/assets/icons/SIconColumn/SIconColumn';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SPopperArrow } from '@v2/components/organisms/SPopper/SPopper';
import { useDisclosure } from '@v2/hooks/useDisclosure';
import { STableButton } from '../../STableButton';
import {
  STableColumnsButtonProps,
  STableColumnsProps,
} from './STableColumnsButton.types';
import { SCheckBox } from '@v2/components/forms/SCheckBox/SCheckBox';

export function STableColumnsButton<T extends string>({
  onClick,
  text,
  popperTile = 'Colunas',
  columns,
  setHiddenColumns,
  hiddenColumns,
  showLabel,
}: STableColumnsButtonProps<T>) {
  const anchorEl = useRef<null | HTMLDivElement>(null);
  const { isOpen, toggle, close } = useDisclosure();

  const handleClick = () => {
    toggle();
    onClick?.();
  };

  const handleSelect = ({ value }: STableColumnsProps, checked: boolean) => {
    setHiddenColumns({
      ...hiddenColumns,
      [value]: checked,
    });
  };

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Box ref={anchorEl}>
        <STableButton
          onClick={handleClick}
          tooltip={text ?? 'Colunas'}
          icon={<SIconColumn fontSize={16} />}
          text={showLabel ? 'Colunas' : undefined}
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
            <SIconColumn color="text.light" fontSize="18px" />
            <SText color={'text.light'}>{popperTile}</SText>
          </SFlex>
        )}
        <SDivider sx={{ mb: 6 }} />
        <SFlex
          px={5}
          pb={5}
          direction={'column'}
          minWidth={200}
          minHeight={200}
        >
          {columns.map((column) => {
            const checked =
              column.value in hiddenColumns
                ? !hiddenColumns[column.value]
                : !column.startHidden;
            return (
              <SCheckBox
                label={column.label}
                checked={checked}
                key={column.value}
                onChange={() => handleSelect(column, checked)}
              />
            );
          })}
        </SFlex>
      </SPopperArrow>
    </Box>
  );
}
