import React, { FC } from 'react';

import { Box } from '@mui/material';
import { MedSelect } from 'components/organisms/tagSelects/MedSelect';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { AdmColumnProps } from './types';
import {
  getCharacterizationPlanItemTintSx,
  getDerivedMeasurePlanStatus,
  getDerivedMeasureTooltipPlanStatus,
} from '../../../../../utils/characterization-action-plan-visual';

export const AdmColumn: FC<{ children?: any } & AdmColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
  planWorkspaceId,
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
        onlyInput="adm"
        onCreate={(adm) => {
          if (adm && adm.id && adm.medType === MedTypeEnum.ADM)
            handleSelect(
              {
                adms: [adm.id],
              },
              adm,
            );

          document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
        }}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id)
            handleSelect(
              {
                adms: [op.id],
              },
              op,
            );
        }}
      />
      {data &&
        data.adms?.map((adm) => {
          const planStatus = getDerivedMeasurePlanStatus(
            data as IRiskData,
            adm.id,
            planWorkspaceId,
          );
          const planTooltipStatus = getDerivedMeasureTooltipPlanStatus(
            data as IRiskData,
            adm.id,
            planWorkspaceId,
          );
          return (
          <SelectedTableItem
            key={adm.id}
            name={adm.medName}
            planStatus={planStatus}
            planTooltipStatus={planTooltipStatus}
            itemTintSx={getCharacterizationPlanItemTintSx(
              planTooltipStatus ?? planStatus,
            )}
            handleRemove={() =>
              handleRemove({
                adms: [adm.id],
              })
            }
          />
          );
        })}
    </Box>
  );
};
