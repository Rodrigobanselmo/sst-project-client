import React, { FC } from 'react';

import { Box } from '@mui/material';
import { RecSelect } from 'components/organisms/tagSelects/RecSelect';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { RecColumnProps } from './types';

export const RecColumn: FC<{ children?: any } & RecColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
}) => {
  return (
    <Box>
      <RecSelect
        disabled={!risk?.id}
        onlyInput="rec"
        text={'adicionar'}
        onlyFromActualRisks
        tooltipTitle=""
        multiple={false}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        onCreate={(rec) => {
          if (rec && rec.id)
            handleSelect(
              {
                recs: [rec.id],
              },
              rec,
            );

          document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
        }}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id)
            handleSelect(
              {
                recs: [op.id],
              },
              op,
            );
        }}
      />
      {data &&
        data.recs?.map((rec) => (
          <SelectedTableItem
            key={rec.id}
            name={rec.recName}
            handleRemove={() =>
              handleRemove({
                probabilityAfter: 0,
                recs: [rec.id],
              })
            }
          />
        ))}
    </Box>
  );
};
