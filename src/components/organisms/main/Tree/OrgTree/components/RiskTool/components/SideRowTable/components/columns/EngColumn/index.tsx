import React, { FC } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { isNaRecMed } from 'project/utils/isNa';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { EngColumnProps } from './types';

export const EngColumn: FC<{ children?: any } & EngColumnProps> = ({
  handleSelect,
  handleRemove,
  handleEdit,
  data,
  risk,
}) => {
  return (
    <Box>
      <MedSelect
        disabled={!risk?.id}
        text={'adicionar'}
        onlyInput="eng"
        onlyFromActualRisks
        tooltipTitle=""
        multiple={false}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        type={MedTypeEnum.ENG}
        onCreate={(engs) => {
          if (engs && engs.id && engs.medType === MedTypeEnum.ENG)
            handleSelect(
              {
                engs: [{ ...engs?.engsRiskData, recMedId: engs.id }],
              },
              engs,
            );

          document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
        }}
        handleSelect={(options: IRecMed) => {
          if (options.id)
            handleSelect(
              {
                engs: [{ ...options?.engsRiskData, recMedId: options.id }],
              },
              options,
            );
        }}
      />
      {data &&
        data.engs?.map((eng) => (
          <SelectedTableItem
            key={eng.id}
            name={eng.medName}
            handleEdit={() => !isNaRecMed(eng.medName) && handleEdit(eng)}
            handleRemove={() =>
              handleRemove({
                engs: [eng.engsRiskData || eng],
              })
            }
          />
        ))}
    </Box>
  );
};
