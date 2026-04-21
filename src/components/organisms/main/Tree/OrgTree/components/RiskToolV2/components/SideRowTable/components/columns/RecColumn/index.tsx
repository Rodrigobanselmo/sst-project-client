import React, { FC } from 'react';

import { Box } from '@mui/material';
import { RecSelect } from 'components/organisms/tagSelects/RecSelect';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';

import { SelectedTableItem } from '../../SelectedTableItem';
import { RecColumnProps } from './types';
import { StatusEnum } from 'project/enum/status.enum';

import {
  getCharacterizationPlanItemTintSx,
  getRecommendationPlanStatus,
  getRecommendationPlanTooltipStatus,
  isRecommendationDeletionAllowed,
  recommendationHasDerivedMeasureLink,
} from '../../../../../utils/characterization-action-plan-visual';

const REC_DELETE_BLOCKED_HINT =
  'Não é possível excluir esta recomendação: o item no Plano de Ação já saiu do status Pendente (Iniciado, Concluído ou Cancelado).';

export const RecColumn: FC<{ children?: any } & RecColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
  planWorkspaceId,
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
        data.recs?.map((rec) => {
          const planStatus = getRecommendationPlanStatus(
            data as IRiskData,
            rec.id,
            planWorkspaceId,
          );
          const planTooltipStatus = getRecommendationPlanTooltipStatus(
            data as IRiskData,
            rec.id,
            planWorkspaceId,
          );
          const canRemoveRec = isRecommendationDeletionAllowed(
            data as IRiskData,
            rec.id,
            planWorkspaceId,
          );
          const showDerivedNote =
            planTooltipStatus === StatusEnum.DONE &&
            recommendationHasDerivedMeasureLink(
              data as IRiskData,
              rec.id,
              planWorkspaceId,
            );
          return (
          <SelectedTableItem
            key={rec.id}
            name={rec.recName}
            planStatus={planStatus}
            planTooltipStatus={planTooltipStatus}
            showPlanDerivedTransformedNote={showDerivedNote}
            planDeleteBlockedHint={
              canRemoveRec ? undefined : REC_DELETE_BLOCKED_HINT
            }
            itemTintSx={getCharacterizationPlanItemTintSx(planTooltipStatus)}
            handleRemove={
              canRemoveRec
                ? () =>
                    handleRemove({
                      probabilityAfter: 0,
                      recs: [rec.id],
                    })
                : undefined
            }
          />
          );
        })}
    </Box>
  );
};
