import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import { RecSelect } from 'components/organisms/tagSelects/RecSelect';
import { resolveResidualProbabilityAfterRecChange } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';
import {
  isRecommendationRecTypeMissing,
  MISSING_REC_TYPE_TOOLTIP,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/isRecommendationRecTypeMissing.util';
import { initialAddRecMedState } from 'components/organisms/modals/ModalAddRecMed/hooks/useAddRecMed';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRecMed } from 'core/interfaces/api/IRiskFactors';
import { useMutUpdateRecMed } from 'core/services/hooks/mutations/checklist/recMed/useMutUpdateRecMed';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { RecTypeEnum } from 'project/enum/recType.enum';
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
  const { onStackOpenModal } = useModal();
  const updateRecMedMut = useMutUpdateRecMed();
  const [classifyingRecId, setClassifyingRecId] = useState<string | null>(null);

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

  const handleEditRec = (rec: IRecMed) => {
    onStackOpenModal<Partial<typeof initialAddRecMedState>>(
      ModalEnum.ENG_MED_ADD,
      {
        riskIds: [risk?.id || ''],
        edit: true,
        risk: risk || undefined,
        companyId: rec.companyId || '',
        recName: rec.recName || '',
        medName: rec.medName || '',
        recType: rec.recType || '',
        status: rec.status,
        id: rec.id,
        onlyInput: 'rec',
      },
    );
  };

  const handleQuickClassify = async (rec: IRecMed, recType: RecTypeEnum) => {
    if (!rec.id) return;
    const riskId = rec.riskId || risk?.id;
    if (!riskId) return;

    setClassifyingRecId(rec.id);
    try {
      await updateRecMedMut.mutateAsync({
        id: rec.id,
        riskId,
        recType,
        companyId: rec.companyId || undefined,
      });
    } finally {
      setClassifyingRecId(null);
    }
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
        const missingType = isRecommendationRecTypeMissing(rec.recType);
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
            showMissingTypeWarning={missingType}
            missingTypeTooltip={MISSING_REC_TYPE_TOOLTIP}
            onQuickClassifyRecType={
              missingType
                ? (recType) => handleQuickClassify(rec, recType)
                : undefined
            }
            quickClassifyLoading={classifyingRecId === rec.id}
            handleEdit={() => handleEditRec(rec)}
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
