import React, { FC, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { RecSelect } from 'components/organisms/tagSelects/RecSelect';
import { sortRecsByTypeHierarchy } from 'components/organisms/tagSelects/RecSelect/resolve-rec-type-visual-state.util';
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

import { catalogControlDisplayName } from '../../../../../catalog-control-display-name.util';
import { InformativeControlLinkAction } from '../../../../InformativeControlLinkAction';
import {
  buildInformativeControlLinkPayload,
  openFactorCorrespondenceRecIds,
  resolveInformativeRecommendationLink,
} from '../../../../../utils/existing-control-correspondence.util';
import { SelectedTableItem } from '../../SelectedTableItem';
import { RecColumnProps } from './types';

import {
  getCharacterizationPlanItemTintSx,
  getRecommendationPlanStatus,
  getRecommendationPlanTooltipStatus,
  isExistingControlCorrespondence,
  isRecommendationDeletionAllowed,
  isRecMedRemovableFromActionPlanStatus,
  recommendationHasDerivedMeasureLink,
} from '../../../../../utils/characterization-action-plan-visual';
import { RiskCatalogBulkAddButton } from '../../../../../risk-catalog-bulk-add/RiskCatalogBulkAddButton';
import {
  buildRecsAttachPayload,
  resolveRecsSelectedForAdd,
} from '../../../../../risk-catalog-bulk-add/with-residual-probability-after-rec-change.util';
import { RiskCatalogBatchCopyButton } from '../../../../../risk-catalog-dnd/RiskCatalogBatchCopyButton';
import { RiskCatalogDraggableItem } from '../../../../../risk-catalog-dnd/RiskCatalogDraggableItem';
import { RiskCatalogDropColumn } from '../../../../../risk-catalog-dnd/RiskCatalogDropColumn';
import { RiskCatalogDndDragItem } from '../../../../../risk-catalog-dnd/risk-catalog-dnd.types';
import { RiskFactorFieldAiButton } from '../../../../../risk-factors-ai/RiskFactorAiButton';

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
  const residualRecs = validRecs.filter(
    (rec) => !isExistingControlCorrespondence(rec),
  );
  const displayedRecs = sortRecsByTypeHierarchy(residualRecs);

  const batchItems = useMemo((): RiskCatalogDndDragItem[] => {
    return (data?.recs ?? [])
      .filter(
        (rec): rec is IRecMed =>
          !!rec &&
          typeof rec.id === 'string' &&
          !!rec.id &&
          !isExistingControlCorrespondence(rec) &&
          !!catalogControlDisplayName(rec, 'recommendation'),
      )
      .map((rec) => ({
        kind: 'rec' as const,
        sourceRiskId: risk?.id || '',
        name: catalogControlDisplayName(rec, 'recommendation'),
        catalogId: rec.id,
        recType: rec.recType || undefined,
      }));
  }, [data?.recs, risk?.id]);

  const buildAddPayload = (rec: IRecMed): Partial<IUpsertRiskData> =>
    buildRecsAttachPayload({
      recsToAdd: [rec],
      currentRecs: residualRecs,
      realProbability: data?.probability,
      currentResidual: data?.probabilityAfter,
    });

  const buildRemovePayload = (recId: string): Partial<IUpsertRiskData> => {
    const nextRecs = residualRecs.filter((rec) => rec.id !== recId);
    const probabilityAfter = resolveResidualProbabilityAfterRecChange({
      realProbability: data?.probability,
      currentResidual: data?.probabilityAfter,
      previousRecommendations: residualRecs,
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
    <RiskCatalogDropColumn
      kind="rec"
      risk={risk}
      riskData={data as IRiskData}
      handleSelect={handleSelect}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RecSelect
            disabled={!risk?.id}
            onlyInput="rec"
            text={'adicionar'}
            onlyFromActualRisks
            tooltipTitle=""
            multiple
            confirmSelectionOnClose={false}
            resolveMultipleAsItems
            enableRecTypeQuickClassify
            lockSelected
            selectedRec={validRecs.map((rec) => rec.id)}
            existingControlLinkedIds={openFactorCorrespondenceRecIds(validRecs)}
            factorRecs={validRecs}
            factorControls={[...(data?.adms ?? []), ...(data?.engs ?? [])]}
            riskIds={[risk?.id || '']}
            risk={risk ? risk : undefined}
            onCreate={(rec) => {
              if (rec && rec.id) handleSelect(buildAddPayload(rec), rec);

              document.getElementById(IdsEnum.INPUT_MENU_SEARCH)?.click();
            }}
            handleSelect={(options) => {
              const recsToAdd = resolveRecsSelectedForAdd(
                options,
                validRecs.map((rec) => rec.id),
              );
              if (!recsToAdd.length) return;
              handleSelect(
                buildRecsAttachPayload({
                  recsToAdd,
                  currentRecs: residualRecs,
                  realProbability: data?.probability,
                  currentResidual: data?.probabilityAfter,
                }),
              );
            }}
          />
          <RiskFactorFieldAiButton
            riskId={risk?.id}
            riskName={risk?.name}
            field="recommendedEngineeringMeasures"
          />
          <RiskFactorFieldAiButton
            riskId={risk?.id}
            riskName={risk?.name}
            field="recommendedAdministrativeMeasures"
          />
          <RiskCatalogBulkAddButton
            kind="rec"
            risk={risk}
            riskData={data as IRiskData}
            handleSelect={handleSelect}
          />
          <RiskCatalogBatchCopyButton
            kind="rec"
            risk={risk}
            items={batchItems}
          />
        </Box>
        {displayedRecs.map((rec) => {
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
          const recommendationName = catalogControlDisplayName(
            rec,
            'recommendation',
          );
          const link = resolveInformativeRecommendationLink({
            rec,
            controls: [...(data?.adms ?? []), ...(data?.engs ?? [])],
            dataRecs: data?.dataRecs,
            derivedMeasures: data?.riskFactorDataRecDerivedMeasures,
            workspaceId: planWorkspaceId,
          });
          return (
            <RiskCatalogDraggableItem
              key={rec.id}
              item={{
                kind: 'rec',
                sourceRiskId: risk?.id || '',
                name: recommendationName,
                catalogId: rec.id,
                recType: rec.recType || undefined,
              }}
              disabled={!risk?.id || !recommendationName}
            >
              <SelectedTableItem
                name={recommendationName}
                recType={rec.recType ?? null}
                planStatus={planStatus}
                planTooltipStatus={planTooltipStatus}
                showPlanDerivedTransformedNote={showDerivedNote}
                planDeleteBlockedHint={
                  canRemoveRec ||
                  isRecMedRemovableFromActionPlanStatus(planStatus)
                    ? undefined
                    : REC_DELETE_BLOCKED_HINT
                }
                itemTintSx={getCharacterizationPlanItemTintSx(
                  planTooltipStatus,
                )}
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
                trailingAction={
                  <InformativeControlLinkAction
                    kind={link.kind}
                    medType={'medType' in link ? link.medType : undefined}
                    onLink={(medType) =>
                      handleSelect(
                        buildInformativeControlLinkPayload(rec.id, medType),
                      )
                    }
                    onUndo={
                      link.kind === 'linked'
                        ? () => handleSelect(link.undo)
                        : undefined
                    }
                  />
                }
              />
            </RiskCatalogDraggableItem>
          );
        })}
      </Box>
    </RiskCatalogDropColumn>
  );
};
