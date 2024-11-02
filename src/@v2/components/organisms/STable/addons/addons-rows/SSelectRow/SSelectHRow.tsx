import { Box, Checkbox } from '@mui/material';
import { FC, useEffect } from 'react';
import {
  TablesSelectEnum,
  useTableSelect,
} from '../../../hooks/useTableSelect';
import { SSelectHRowProps } from './SSelectRow.types';

export const SSelectHRow: FC<SSelectHRowProps> = ({ ids, table, ...props }) => {
  const add = useTableSelect((state) => state.add)(table);
  const remove = useTableSelect((state) => state.remove)(table);
  const selected = useTableSelect((state) => state.has(table)(ids));

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      position="relative"
      width={14}
      height={14}
    >
      <Checkbox
        onChange={() => (selected ? remove(ids) : add(ids))}
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
        {...props}
      />
    </Box>
  );
};
