import { Box, Checkbox } from '@mui/material';
import { FC } from 'react';
import { useTableSelect } from '../../../hooks/useTableSelect';
import { SSelectRowProps } from './SCheckSelectRow.types';

export const SSelectRow: FC<SSelectRowProps> = ({ id, table, ...props }) => {
  const stateSelect = useTableSelect((state) => state.select)(table);
  const selected = useTableSelect((state) => state.has(table)(id));

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      position="relative"
      width={14}
      height={14}
    >
      <Checkbox
        sx={{
          position: 'absolute',
          left: -10,
          top: -10,
          'svg[data-testid="CheckBoxOutlineBlankIcon"]': {
            color: 'grey.400',
            fontSize: '1.0rem',
          },
          '.MuiSvgIcon-root': {
            fontSize: '1.1rem',
          },
        }}
        checked={selected}
        onChange={() => stateSelect(id)}
        {...props}
      />
    </Box>
  );
};
