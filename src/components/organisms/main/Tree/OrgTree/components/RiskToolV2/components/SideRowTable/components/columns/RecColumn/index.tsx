import React, { FC } from 'react';

import { Box } from '@mui/material';
import { RecSelect } from 'components/organisms/tagSelects/RecSelect';
import { resolveResidualProbabilityAfterRecChange } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { StatusEnum } from 'project/enum/status.enum';

import { SelectedTableItem } from '../../SelectedTableItem';
import { RecColumnProps } from './types';

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
  const validRecs = (data?.recs ?? []).filter(
    (rec): rec is IRecMed => !!rec && typeof rec.id === 'string' && !!rec.id,
  );

  const buildAddPayload = (rec: IRecMed): Partial<IUpsertRiskData> => {
    const nextRecs = [...validRecs, rec];
    const probabilityAfter = resolveResidualProbabilityAfterRecChange({
      realProbability: data?.probability,
      currentResidual: data?.probabilityAfter,
      previousRecommendations: validRecs,
      nextRecommendations: nextRecs,
    });

    const payload: Partial<IUpsertRiskData> = { recs: [rec.id] };
    if (probabilityAfter !== undefined) {
      payload.probabilityAfter = probabilityAfter;
    }
    return payload;
  };

  const buildRemovePayload = (recId: string): Partial<IUpsertRiskData> => {
    const nextRecs = validRecs.filter((rec) => rec.id !== recId);
    const probabilityAfter = resolveResidualProbabilityAfterRecChange({
      realProbability: data?.probability,
      currentResidual: data?.probabilityAfter,
      previousRecommendations: validRecs,
      nextRecommendations: nextRecs,
    });

    const payload: Partial<IUpsertRiskData> = { recs: [recId] };
    if (probabilityAfter !== undefined) {
      payload.probabilityAfter = probabilityAfter;
    }
    return payload;
  };

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
            handleSelect(buildAddPayload(rec), rec);

          document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
        }}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op?.id) handleSelect(buildAddPayload(op), op);
        }}
      />
      {validRecs.map((rec) => {
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
            name={rec.recName || 'Recomendação'}
            planStatus={planStatus}
            planTooltipStatus={planTooltipStatus}
            showPlanDerivedTransformedNote={showDerivedNote}
            planDeleteBlockedHint={
              canRemoveRec ? undefined : REC_DELETE_BLOCKED_HINT
            }
            itemTintSx={getCharacterizationPlanItemTintSx(planTooltipStatus)}
            handleRemove={
              canRemoveRec
                ? () => handleRemove(buildRemovePayload(rec.id))
                : undefined
            }
          />
        );
      })}
    </Box>
  );
};
