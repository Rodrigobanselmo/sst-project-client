import React, { FC } from 'react';

import { Box } from '@mui/material';
import { EpiSelect } from 'components/organisms/tagSelects/EpiSelect';

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
              epis: [op.id],
            });
        }}
      />
      {data &&
        data.epis?.map((epi) => (
          <SelectedTableItem
            key={epi.ca}
            name={epi.ca}
            tooltip={epi.equipment}
            handleRemove={() =>
              handleRemove({
                epis: [epi.id],
              })
            }
          />
        ))}
    </Box>
  );
};