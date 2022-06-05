import React, { FC } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { AdmColumnProps } from './types';

export const AdmColumn: FC<AdmColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
}) => {
  return (
    <Box>
      <MedSelect
        disabled={!risk?.id}
        onlyFromActualRisks
        text={'adicionar'}
        tooltipTitle=""
        multiple={false}
        riskIds={[risk?.id || '']}
        risk={risk ? risk : undefined}
        type={MedTypeEnum.ADM}
        onCreate={(recMed) => {
          if (recMed && recMed.id)
            handleSelect({
              adms: [recMed.id],
            });

          document.getElementById('menu-close')?.click();
        }}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id)
            handleSelect({
              adms: [op.id],
            });
        }}
      />
      {data &&
        data.adms?.map((adm) => (
          <SelectedTableItem
            key={adm.id}
            name={adm.medName}
            handleRemove={() =>
              handleRemove({
                adms: [adm.id],
              })
            }
          />
        ))}
    </Box>
  );
};
