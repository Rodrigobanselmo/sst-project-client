import CheckIcon from '@mui/icons-material/Check';
import { Box, Chip, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import {
  FormAiAnalysisStatusEnum,
  type IFormQuestionsAnswersAnalysisBrowseResultModel,
} from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import type {
  AnalysisInventoryStatusMap,
  AnalysisItemInventoryEntry,
} from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';
import { getMatrizRisk } from 'core/utils/helpers/matriz';
import type { IRiskData } from 'core/interfaces/api/IRiskData';

import type { HierarchyGroupForRiskAnalysis } from '../../helpers/expandRiskAnalysisEntitiesForHierarchyGroups';
import {
  formatRiskAnalysisMemberLabel,
  sortMemberEntityIdsForDisplay,
} from '../../helpers/buildRiskAnalysisDisplayPartitions';
import {
  buildTargetAiAnalysisViewModel,
  resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback,
} from '../../helpers/resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback';
import { resolveTargetAnalysisItemStatus } from '../../helpers/resolveTargetAnalysisItemStatus';
import {
  resolveGroupRiskAnalysisDisplay,
  isGroupRiskAnalysisProcessing,
} from '../../helpers/group-risk-analysis-display.utils';
import { isOccupationalRiskEligibleForAiAnalysis } from './form-ai-analysis.utils';
import { getFormAiAnalysisErrorMessage } from './form-ai-analysis.utils';
import {
  badgeSx,
  formatTwoDigits,
  isValidMatrixValue,
  occupationalRiskBadgeSx,
  occupationalRiskColorMap,
  probabilityMap,
  resolveOccupationalRiskLabel,
  groupCollectiveRiskButtonSx,
  groupAnalyzeButtonSx,
  sectorRowElementBaseSx,
  sectorRowBadgeTextSx,
  sectorRowClassificationDotSx,
  sectorRowClassificationDotsSx,
  sectorRowStackSx,
  severityMap,
} from './form-risks-analysis-sector.styles';
import { RiskEntityAiAnalysisPanel } from './RiskEntityAiAnalysisPanel';
import { MemberPendingItemCodeChip } from './MemberPendingItemCodeChip';
import {
  buildAnalysisItemCodeRegistry,
  type AnalysisItemCodeEntry,
} from '../../helpers/analysis-item-codes.utils';

type AnalysisItemType =
  | 'fontesGeradoras'
  | 'medidasEngenhariaRecomendadas'
  | 'medidasAdministrativasRecomendadas';

export type HierarchyGroupRiskAnalysisCardProps = {
  riskId: string;
  risk: { severity?: number; name?: string };
  group: HierarchyGroupForRiskAnalysis;
  memberEntityIds: string[];
  entityMap: Record<
    string,
    { id: string; name: string; type: string; companyId?: string }
  >;
  hierarchyGroups: HierarchyGroupForRiskAnalysis[];
  analysisResults: IFormQuestionsAnswersAnalysisBrowseResultModel[];
  getEffectiveProbability: (entityId: string, riskId: string) => number;
  isRiskInInventory: (riskId: string, entityId: string) => boolean;
  analysisKey: string;
  isAnalysisExpanded: boolean;
  onAnalysisToggle: (analysisKey: string) => void;
  onAnalyzeGroup: (riskId: string, memberEntityIds: string[]) => void;
  onAddRiskToEntity: (riskId: string, entityId: string) => void;
  onAddRiskToAllGroupMembers: (riskId: string, memberEntityIds: string[]) => void;
  entityEstablishmentMap?: Map<string, string>;
  onAddAnalysisAsRiskData: (
    analysis: IFormQuestionsAnswersAnalysisBrowseResultModel,
    options?: {
      skipItemStatus?: boolean;
      skipMarkAnalysisApplied?: boolean;
      isHierarchyGroupFallback?: boolean;
      sourceAnalysisId?: string;
      riskDataForHierarchy?: IRiskData[];
    },
  ) => void;
  getApplyAnalysisButtonProps: (
    analysis: {
      id: string;
      riskId: string;
      hierarchyId: string;
      analysis?: Record<string, unknown> | null;
    },
    options?: {
      isHierarchyGroupFallback?: boolean;
      sourceAnalysisId?: string;
      riskDataForHierarchy?: IRiskData[];
    },
  ) => { text: string; color: 'paper' | 'success' };
  riskDataByHierarchyId: Map<string, IRiskData[]>;
  analysisInventoryStatus: AnalysisInventoryStatusMap;
  locallyAppliedItemKeys: Set<string>;
  applyingItemKey: string | null;
  buildApplyingItemKey: (
    analysisId: string,
    itemType: AnalysisItemType,
    itemIndex: number,
  ) => string;
  handleAddSingleAnalysisItem: (
    analysis: IFormQuestionsAnswersAnalysisBrowseResultModel,
    itemType: AnalysisItemType,
    itemIndex: number,
    item: { nome: string },
    options?: { skipMarkAnalysisApplied?: boolean },
  ) => void;
  handleEditAnalysisItem: (
    analysisId: string,
    itemType: AnalysisItemType,
    itemIndex: number,
    newName: string,
    analysis: IFormQuestionsAnswersAnalysisBrowseResultModel,
  ) => Promise<void>;
  handleRemoveAnalysisItem: (
    analysisId: string,
    itemType: AnalysisItemType,
    itemIndex: number,
    analysis: IFormQuestionsAnswersAnalysisBrowseResultModel,
  ) => Promise<void>;
  createInheritedAnalysisItemEditHandler: (
    sourceAnalysis: { id: string; analysis?: Record<string, unknown> | null },
    itemType: AnalysisItemType,
    itemIndex: number,
  ) => (newName: string) => Promise<boolean>;
  createInheritedAnalysisItemRemoveHandler: (
    sourceAnalysis: { id: string; analysis?: Record<string, unknown> | null },
    itemType: AnalysisItemType,
    itemIndex: number,
  ) => () => Promise<void>;
  getAnalysisItemStatus: (
    analysisId: string,
    itemType: AnalysisItemType,
    itemIndex: number,
  ) => AnalysisItemInventoryEntry | undefined;
  onAddAnalysisItemToAllGroupMembers: (
    itemType: AnalysisItemType,
    itemIndex: number,
    item: { nome: string },
    memberEntityIds: string[],
  ) => Promise<void>;
  onAddMemberAnalysisItem: (
    entityId: string,
    entry: AnalysisItemCodeEntry,
  ) => Promise<void>;
};

export function HierarchyGroupRiskAnalysisCard({
  riskId,
  risk,
  group,
  memberEntityIds,
  entityMap,
  hierarchyGroups,
  analysisResults,
  getEffectiveProbability,
  isRiskInInventory,
  analysisKey,
  isAnalysisExpanded,
  onAnalysisToggle,
  onAnalyzeGroup,
  onAddRiskToEntity,
  onAddRiskToAllGroupMembers,
  entityEstablishmentMap,
  onAddAnalysisAsRiskData,
  getApplyAnalysisButtonProps,
  riskDataByHierarchyId,
  analysisInventoryStatus,
  locallyAppliedItemKeys,
  applyingItemKey,
  buildApplyingItemKey,
  handleAddSingleAnalysisItem,
  handleEditAnalysisItem,
  handleRemoveAnalysisItem,
  createInheritedAnalysisItemEditHandler,
  createInheritedAnalysisItemRemoveHandler,
  getAnalysisItemStatus,
  onAddAnalysisItemToAllGroupMembers,
  onAddMemberAnalysisItem,
}: HierarchyGroupRiskAnalysisCardProps) {
  const { resolved, hasMisalignedAnalyses, canonicalMemberId: displayCanonicalId } =
    resolveGroupRiskAnalysisDisplay({
      riskId,
      memberEntityIds,
      results: analysisResults,
      hierarchyGroups,
    });

  const probability = getEffectiveProbability(displayCanonicalId, riskId);
  const severity = risk?.severity;
  const hasValidSeverity = isValidMatrixValue(severity);
  const hasValidProbability = isValidMatrixValue(probability);
  const matriz =
    hasValidSeverity && hasValidProbability
      ? getMatrizRisk(severity, probability)
      : null;
  const occupationalRiskLabel = resolveOccupationalRiskLabel(severity, probability);

  const isProcessing = isGroupRiskAnalysisProcessing({
    riskId,
    memberEntityIds,
    results: analysisResults,
  });

  const hasReanalysis = memberEntityIds.some((hierarchyId) =>
    analysisResults.some(
      (item) =>
        item.riskId === riskId &&
        item.hierarchyId === hierarchyId &&
        (item.status === FormAiAnalysisStatusEnum.DONE ||
          item.status === FormAiAnalysisStatusEnum.FAILED ||
          item.status === FormAiAnalysisStatusEnum.PROCESSING),
    ),
  );

  const sourceAnalysis = resolved.analysis;
  const displayAnalysisContent = sourceAnalysis?.analysis ?? null;

  const itemCodeRegistry = useMemo(
    () => buildAnalysisItemCodeRegistry(displayAnalysisContent),
    [displayAnalysisContent],
  );

  const isHierarchyGroupFallback = resolved.source === 'hierarchy_group_fallback';

  const panelAnalysis =
    sourceAnalysis && resolved.analysis
      ? buildTargetAiAnalysisViewModel({
          resolved,
          targetHierarchyId: displayCanonicalId,
          targetProbability: getEffectiveProbability(displayCanonicalId, riskId),
        })
      : null;

  const sortedMemberEntityIds = sortMemberEntityIdsForDisplay({
    memberEntityIds,
    entityMap,
    entityEstablishmentMap,
  });

  const membersPendingRiskAdd = sortedMemberEntityIds.filter(
    (entityId) => !isRiskInInventory(riskId, entityId),
  );

  const allMembersHaveRisk = membersPendingRiskAdd.length === 0;

  const [applyingGroupItemKey, setApplyingGroupItemKey] = useState<string | null>(
    null,
  );
  const [applyingMemberItemKey, setApplyingMemberItemKey] = useState<string | null>(
    null,
  );

  const buildGroupItemApplyingKey = useCallback(
    (itemType: AnalysisItemType, itemIndex: number) =>
      `group:${riskId}:${group.id}:${itemType}:${itemIndex}`,
    [group.id, riskId],
  );

  const resolveMemberItemStatus = useCallback(
    (
      entityId: string,
      itemType: AnalysisItemType,
      itemName: string,
      itemIndex: number,
    ) => {
      const memberResolved = resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback(
        {
          riskId,
          entityId,
          results: analysisResults,
          hierarchyGroups,
        },
      );

      if (!memberResolved.analysis) return undefined;

      const memberIsFallback =
        memberResolved.source === 'hierarchy_group_fallback';

      return memberIsFallback
        ? resolveTargetAnalysisItemStatus({
            riskId,
            targetHierarchyId: entityId,
            itemType,
            itemName,
            itemIndex,
            sourceAnalysisId: memberResolved.analysis.id,
            results: analysisResults,
            analysisInventoryStatus,
            riskDataForHierarchy: riskDataByHierarchyId.get(entityId),
            locallyAppliedItemKeys,
          })
        : getAnalysisItemStatus(memberResolved.analysis.id, itemType, itemIndex);
    },
    [
      analysisInventoryStatus,
      analysisResults,
      getAnalysisItemStatus,
      hierarchyGroups,
      locallyAppliedItemKeys,
      riskDataByHierarchyId,
      riskId,
    ],
  );

  const isGroupItemAddable = useCallback(
    (itemType: AnalysisItemType, itemName: string, itemIndex: number) =>
      sortedMemberEntityIds.some((entityId) => {
        const status = resolveMemberItemStatus(
          entityId,
          itemType,
          itemName,
          itemIndex,
        );
        return status?.existsInInventory !== true;
      }),
    [resolveMemberItemStatus, sortedMemberEntityIds],
  );

  const handleGroupItemAdd = useCallback(
    async (
      itemType: AnalysisItemType,
      itemIndex: number,
      item: { nome: string },
    ) => {
      const applyingKey = buildGroupItemApplyingKey(itemType, itemIndex);
      setApplyingGroupItemKey(applyingKey);

      try {
        await onAddAnalysisItemToAllGroupMembers(
          itemType,
          itemIndex,
          item,
          sortedMemberEntityIds,
        );
      } finally {
        setApplyingGroupItemKey(null);
      }
    },
    [
      buildGroupItemApplyingKey,
      onAddAnalysisItemToAllGroupMembers,
      sortedMemberEntityIds,
    ],
  );

  const handleMemberItemClick = useCallback(
    async (entityId: string, entry: AnalysisItemCodeEntry) => {
      const applyingKey = `${entityId}:${entry.code}`;
      setApplyingMemberItemKey(applyingKey);
      try {
        await onAddMemberAnalysisItem(entityId, entry);
      } finally {
        setApplyingMemberItemKey(null);
      }
    },
    [onAddMemberAnalysisItem],
  );

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.300',
      }}
    >
      <Box mb={2}>
        <Typography variant="body1" fontWeight="medium">
          Agrupamento: {group.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic', fontSize: 12, mt: 0.5 }}
        >
          Análise aplicada pelo agrupamento de setores
        </Typography>
        <SFlex gap={1} flexWrap="wrap" mt={1.5}>
          {sortedMemberEntityIds.map((entityId) => (
            <Chip
              key={entityId}
              label={formatRiskAnalysisMemberLabel({
                entityId,
                entityMap,
                entityEstablishmentMap,
              })}
              size="small"
              variant="outlined"
            />
          ))}
        </SFlex>
        {hasMisalignedAnalyses && (
          <Typography variant="caption" color="warning.dark" sx={{ mt: 1, display: 'block' }}>
            Possível desalinhamento entre análises antigas dos membros. Limpe ou
            reanalise o agrupamento para uniformizar.
          </Typography>
        )}
      </Box>

      <SFlex alignItems="center" gap={2} mb={2} flexWrap="wrap">
        <SFlex flex={1} minWidth={0} />

        <SFlex sx={sectorRowStackSx}>
          {allMembersHaveRisk ? (
            <Box
              sx={{
                ...sectorRowElementBaseSx,
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 1,
                color: 'success.main',
                gap: 0.5,
              }}
            >
              <CheckIcon sx={{ fontSize: 14 }} />
              <SText color="success.main" fontSize={11} sx={{ lineHeight: 1.2 }}>
                Risco adicionado
              </SText>
            </Box>
          ) : (
            <SButton
              variant="shade"
              color="paper"
              text={'Adicionar risco a todos os setores\ndeste agrupamento'}
              onClick={() =>
                onAddRiskToAllGroupMembers(riskId, sortedMemberEntityIds)
              }
              buttonProps={{ sx: groupCollectiveRiskButtonSx }}
            />
          )}
          <SButton
            variant="shade"
            color="primary"
            text={
              isProcessing
                ? 'Analisando IA...'
                : hasReanalysis
                  ? 'Analisar IA novamente do agrupamento'
                  : 'Analisar IA do agrupamento'
            }
            loading={isProcessing}
            disabled={isProcessing}
            onClick={() => onAnalyzeGroup(riskId, memberEntityIds)}
            buttonProps={{ sx: groupAnalyzeButtonSx }}
          />
        </SFlex>

        <SFlex sx={sectorRowStackSx}>
          <Box sx={badgeSx(probabilityMap[probability || 0].color)}>
            <Typography variant="body2" color="text.main" sx={sectorRowBadgeTextSx}>
              Probabilidade:{' '}
              {hasValidProbability
                ? `${formatTwoDigits(probability)} ${probabilityMap[probability].label}`
                : 'Não informado'}
            </Typography>
          </Box>
          <Box
            sx={badgeSx(
              hasValidSeverity ? severityMap[severity].color : severityMap[0].color,
            )}
          >
            <Typography variant="body2" color="text.main" sx={sectorRowBadgeTextSx}>
              Severidade:{' '}
              {hasValidSeverity
                ? `${formatTwoDigits(severity)} ${severityMap[severity].label}`
                : 'Não informado'}
            </Typography>
          </Box>
        </SFlex>

        <Box
          sx={occupationalRiskBadgeSx(
            occupationalRiskColorMap[occupationalRiskLabel] ??
              occupationalRiskColorMap['Não informado'],
          )}
        >
          <Box sx={sectorRowClassificationDotsSx}>
            <Box
              sx={sectorRowClassificationDotSx(
                probabilityMap[probability || 0].color,
              )}
            />
            <Box
              sx={sectorRowClassificationDotSx(
                hasValidSeverity ? severityMap[severity].color : severityMap[0].color,
              )}
            />
          </Box>
          <Typography
            variant="body2"
            color="text.main"
            fontWeight={600}
            sx={sectorRowBadgeTextSx}
          >
            Risco Ocupacional: {occupationalRiskLabel}
          </Typography>
        </Box>
      </SFlex>

      {analysisResults.length > 0 && (
        <>
          {!resolved.analysis && resolved.failedAnalysis && matriz &&
            isOccupationalRiskEligibleForAiAnalysis(matriz) && (
              <Box mt={3}>
                <Typography
                  variant="body2"
                  color="error.main"
                  sx={{ fontStyle: 'italic' }}
                >
                  Análise de IA falhou:{' '}
                  {getFormAiAnalysisErrorMessage(
                    resolved.failedAnalysis.metadata as
                      | Record<string, unknown>
                      | undefined,
                  )}
                </Typography>
              </Box>
            )}

          {sourceAnalysis && panelAnalysis && displayAnalysisContent && (
            <RiskEntityAiAnalysisPanel
              riskId={riskId}
              analysisKey={analysisKey}
              isAnalysisExpanded={isAnalysisExpanded}
              onAnalysisToggle={onAnalysisToggle}
              sourceAnalysis={sourceAnalysis}
              analysis={panelAnalysis}
              displayAnalysisContent={displayAnalysisContent}
              isHierarchyGroupFallback={isHierarchyGroupFallback}
              showInheritedBanner={false}
              groupPerItemAdd={{
                label: 'Adicionar ao agrupamento',
                applyingKey: applyingGroupItemKey,
                buildApplyingKey: buildGroupItemApplyingKey,
                isItemAddable: isGroupItemAddable,
                onAdd: handleGroupItemAdd,
              }}
              resolveDisplayedItemStatus={(itemType, itemName, itemIndex) =>
                isHierarchyGroupFallback
                  ? resolveTargetAnalysisItemStatus({
                      riskId,
                      targetHierarchyId: displayCanonicalId,
                      itemType,
                      itemName,
                      itemIndex,
                      sourceAnalysisId: sourceAnalysis.id,
                      results: analysisResults,
                      analysisInventoryStatus,
                      riskDataForHierarchy:
                        riskDataByHierarchyId.get(displayCanonicalId),
                      locallyAppliedItemKeys,
                    })
                  : getAnalysisItemStatus(sourceAnalysis.id, itemType, itemIndex)
              }
              applyingItemKey={applyingItemKey}
              buildApplyingItemKey={buildApplyingItemKey}
              handleAddSingleAnalysisItem={handleAddSingleAnalysisItem}
              handleEditAnalysisItem={handleEditAnalysisItem}
              handleRemoveAnalysisItem={handleRemoveAnalysisItem}
              createInheritedAnalysisItemEditHandler={
                createInheritedAnalysisItemEditHandler
              }
              createInheritedAnalysisItemRemoveHandler={
                createInheritedAnalysisItemRemoveHandler
              }
            />
          )}
        </>
      )}

      <Box mt={3}>
        <SText variant="body2" fontWeight={600} color="text.secondary" mb={2}>
          Ações por setor membro
        </SText>
        <SFlex direction="column" gap={2}>
          {sortedMemberEntityIds.map((entityId) => {
            const memberResolved =
              resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({
                riskId,
                entityId,
                results: analysisResults,
                hierarchyGroups,
              });
            const memberAnalysis =
              memberResolved.analysis &&
              buildTargetAiAnalysisViewModel({
                resolved: memberResolved,
                targetHierarchyId: entityId,
                targetProbability: getEffectiveProbability(entityId, riskId),
              });

            const memberIsFallback =
              memberResolved.source === 'hierarchy_group_fallback';
            const memberFallbackOptions = memberIsFallback
              ? {
                  isHierarchyGroupFallback: true as const,
                  sourceAnalysisId: memberResolved.analysis!.id,
                  riskDataForHierarchy: riskDataByHierarchyId.get(entityId),
                }
              : undefined;

            const applyProps =
              memberAnalysis && memberResolved.analysis
                ? getApplyAnalysisButtonProps(memberAnalysis, memberFallbackOptions)
                : null;

            const pendingItemEntries = isRiskInInventory(riskId, entityId)
              ? itemCodeRegistry.entries.filter((entry) => {
                  const status = resolveMemberItemStatus(
                    entityId,
                    entry.itemType,
                    entry.nome,
                    entry.itemIndex,
                  );
                  return status?.existsInInventory !== true;
                })
              : [];

            return (
              <SFlex
                key={entityId}
                alignItems="center"
                gap={2}
                flexWrap="wrap"
                sx={{
                  py: 1.5,
                  px: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <SFlex direction="column" gap={0.25} sx={{ minWidth: 120 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {formatRiskAnalysisMemberLabel({
                      entityId,
                      entityMap,
                      entityEstablishmentMap,
                    })}
                  </Typography>
                  {pendingItemEntries.length > 0 && (
                    <SFlex direction="column" gap={0.5} mt={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        Pendentes:
                      </Typography>
                      <SFlex gap={0.5} flexWrap="wrap" alignItems="center">
                        {pendingItemEntries.map((entry) => (
                          <MemberPendingItemCodeChip
                            key={`${entityId}-${entry.code}`}
                            code={entry.code}
                            title={entry.nome}
                            isApplying={
                              applyingMemberItemKey === `${entityId}:${entry.code}`
                            }
                            onClick={() => handleMemberItemClick(entityId, entry)}
                          />
                        ))}
                      </SFlex>
                    </SFlex>
                  )}
                </SFlex>
                {isRiskInInventory(riskId, entityId) ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'success.main',
                      fontSize: 11,
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 14 }} />
                    Risco adicionado
                  </Box>
                ) : (
                  <SButton
                    variant="shade"
                    color="paper"
                    text="Adicionar somente neste setor"
                    onClick={() => onAddRiskToEntity(riskId, entityId)}
                    buttonProps={{ sx: { fontSize: '0.7rem', py: 0.5 } }}
                  />
                )}
                {memberAnalysis && applyProps && (
                  <SButton
                    variant="shade"
                    color={applyProps.color}
                    size="s"
                    text={applyProps.text}
                    onClick={() =>
                      onAddAnalysisAsRiskData(
                        memberAnalysis,
                        memberIsFallback
                          ? {
                              ...memberFallbackOptions,
                              skipMarkAnalysisApplied: true,
                            }
                          : undefined,
                      )
                    }
                    buttonProps={{
                      sx: { ml: 'auto', fontSize: '0.75rem' },
                    }}
                  />
                )}
              </SFlex>
            );
          })}
        </SFlex>
      </Box>
    </Box>
  );
}
