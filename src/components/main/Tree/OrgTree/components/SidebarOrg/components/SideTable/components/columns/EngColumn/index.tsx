import React, { FC } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EngColumnProps } from './types';

export const EngColumn: FC<EngColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
}) => {
  return (
    <Box>
      <MedSelect
        disabled={!risk?.id}
        text={'adicionar'}
        onlyFromActualRisks
        tooltipTitle=""
        multiple={false}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        type={MedTypeEnum.ENG}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id)
            handleSelect({
              eng: [{ id: op.id, name: op.medName }],
            });
        }}
      />
      {data.eng?.map((eng) => (
        <SelectedTableItem
          key={eng.id}
          name={eng.name}
          handleRemove={() =>
            handleRemove({
              eng: [{ id: eng.id, name: '' }],
            })
          }
        />
      ))}
    </Box>
  );
};
