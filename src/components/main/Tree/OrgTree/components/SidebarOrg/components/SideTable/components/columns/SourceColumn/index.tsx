import React, { FC } from 'react';

import { Box } from '@mui/material';
import { GenerateSourceSelect } from 'components/tagSelects/GenerateSourceSelect';

import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { SourceColumnProps } from './types';

export const SourceColumn: FC<SourceColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
}) => {
  return (
    <Box>
      <GenerateSourceSelect
        disabled={!risk?.id}
        onlyFromActualRisks
        text={'adicionar'}
        tooltipTitle=""
        multiple={false}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        handleSelect={(options) => {
          const op = options as IGenerateSource;
          if (op.id)
            handleSelect({
              gs: [{ id: op.id, name: op.name }],
            });
        }}
      />
      {data.gs?.map((gs) => (
        <SelectedTableItem
          key={gs.id}
          name={gs.name}
          handleRemove={() =>
            handleRemove({
              gs: [{ id: gs.id, name: '' }],
            })
          }
        />
      ))}
    </Box>
  );
};
