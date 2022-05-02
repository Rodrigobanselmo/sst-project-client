import React, { FC } from 'react';

import { Box } from '@mui/material';
import { EpiSelect } from 'components/tagSelects/EpiSelect';

import { IEpi } from 'core/interfaces/api/IEpi';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EpiColumnProps } from './types';

export const EpiColumn: FC<EpiColumnProps> = ({
  handleSelect,
  data,
  handleRemove,
  risk,
}) => {
  return (
    <Box>
      <EpiSelect
        asyncLoad
        disabled={!risk?.id}
        text={'adicionar'}
        tooltipTitle=""
        multiple={false}
        handleSelect={(options) => {
          const op = options as IEpi;
          if (op.id)
            handleSelect({
              epi: [{ ca: op.ca, name: op.equipment, id: op.id }],
            });
        }}
      />
      {data.epi?.map((epi) => (
        <SelectedTableItem
          key={epi.ca}
          name={epi.ca}
          tooltip={epi.name}
          handleRemove={() =>
            handleRemove({
              epi: [{ id: epi.id, name: '', ca: '' }],
            })
          }
        />
      ))}
    </Box>
  );
};
