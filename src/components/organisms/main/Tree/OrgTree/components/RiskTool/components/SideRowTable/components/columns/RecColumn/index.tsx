import React, { FC } from 'react';

import { Box } from '@mui/material';
import { RecSelect } from 'components/organisms/tagSelects/RecSelect';
import { resolveResidualProbabilityAfterRecChange } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';

import { IdsEnum } from 'core/enums/ids.enums';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { SelectedTableItem } from '../../SelectedTableItem';
import { RecColumnProps } from './types';

export const RecColumn: FC<{ children?: any } & RecColumnProps> = ({
  handleSelect,
  handleRemove,
  data,
  risk,
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
          if (rec && rec.id) handleSelect(buildAddPayload(rec), rec);

          document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
        }}
        handleSelect={(options) => {
          const op = options as IRecMed;
          if (op.id) handleSelect(buildAddPayload(op), op);
        }}
      />
      {validRecs.map((rec) => (
        <SelectedTableItem
          key={rec.id}
          name={rec.recName}
          handleRemove={() => handleRemove(buildRemovePayload(rec.id))}
        />
      ))}
    </Box>
  );
};
