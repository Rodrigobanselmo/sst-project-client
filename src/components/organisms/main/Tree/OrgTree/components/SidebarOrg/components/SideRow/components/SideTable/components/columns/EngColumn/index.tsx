import React, { FC } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
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
        onCreate={(engs) => {
          if (engs && engs.id)
            handleSelect({
              engs: [engs.id],
            });

          document.getElementById('menu-close')?.click();
        }}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id)
            handleSelect({
              engs: [op.id],
            });
        }}
      />
      {data &&
        data.engs?.map((eng) => (
          <SelectedTableItem
            key={eng.id}
            name={eng.medName}
            handleRemove={() =>
              handleRemove({
                engs: [eng.id],
              })
            }
          />
        ))}
    </Box>
  );
};
