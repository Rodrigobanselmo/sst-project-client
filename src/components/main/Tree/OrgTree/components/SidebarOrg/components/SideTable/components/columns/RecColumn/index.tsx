import React, { FC } from 'react';

import { Box } from '@mui/material';
import { RecSelect } from 'components/tagSelects/RecSelect';

import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { RecColumnProps } from './types';

export const RecColumn: FC<RecColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
}) => {
  return (
    <Box>
      <RecSelect
        disabled={!risk?.id}
        text={'adicionar'}
        onlyFromActualRisks
        tooltipTitle=""
        multiple={false}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id)
            handleSelect({
              rec: [{ id: op.id, name: op.recName }],
            });
        }}
      />
      {data.rec?.map((rec) => (
        <SelectedTableItem
          key={rec.id}
          name={rec.name}
          handleRemove={() =>
            handleRemove({
              rec: [{ id: rec.id, name: '' }],
            })
          }
        />
      ))}
    </Box>
  );
};
