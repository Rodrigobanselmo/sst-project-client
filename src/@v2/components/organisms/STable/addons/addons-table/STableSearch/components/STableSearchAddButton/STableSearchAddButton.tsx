import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Icon } from '@mui/material';
import STooltip from 'components/atoms/STooltip';

import { STableSearchAddButtonProps } from './STableSearchAddButton.types';

export const STableAddButton: FC<STableSearchAddButtonProps> = ({
  onClick,
  text,
}) => {
  return (
    <STooltip title={text ? '' : 'Adicionar'}>
      <Box>
        <Button
          onClick={onClick}
          variant="contained"
          color="success"
          sx={{
            height: [30, 30, 38],
            minWidth: [30, 30, 38],
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
            '&:active': {
              boxShadow: 'none',
            },
            borderRadius: 1,
            m: 0,
            ml: 2,
            px: 4,
          }}
        >
          <Icon
            component={AddIcon}
            sx={{
              fontSize: ['1.1rem', '1.1rem', '1.4rem'],
              color: 'common.white',
            }}
          />
          {text && <Box mr={3}>{text}</Box>}
        </Button>
      </Box>
    </STooltip>
  );
};
