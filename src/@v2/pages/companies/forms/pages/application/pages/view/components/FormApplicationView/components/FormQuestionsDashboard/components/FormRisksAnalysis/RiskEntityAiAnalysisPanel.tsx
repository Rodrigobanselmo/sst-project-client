import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Box, TextField, Typography } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SText } from '@v2/components/atoms/SText/SText';
import type { IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import type { AnalysisItemInventoryEntry } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';
import type { AiRiskAnalysisResponse } from '@v2/services/forms/ai-analyze-risks/service/ai-analyze-risks.types';
import { SIconDelete } from '@v2/assets/icons/SIconDelete/SIconDelete';
import { useEffect, useMemo, useState } from 'react';

import { AnalysisItemStatusBadges } from './AnalysisItemStatusBadges';
import { AnalysisItemCodeBadge } from './AnalysisItemCodeBadge';
import {
  buildAnalysisItemCodeRegistry,
  type AnalysisItemCodeType,
} from '../../helpers/analysis-item-codes.utils';

type AnalysisItemType = AnalysisItemCodeType;

type EditableAnalysisItemProps = {
  item: { nome: string; justificativa?: string };
  itemIndex: number;
  analysisId: string;
  itemType: AnalysisItemType;
  analysis: IFormQuestionsAnswersAnalysisBrowseResultModel;
  backgroundColor: string;
  borderColor: string;
  itemStatus?: AnalysisItemInventoryEntry;
  onAddItem?: () => void;
  isAddingItem?: boolean;
  addItemLabel?: string;
  itemCode?: string;
  readOnly?: boolean;
  onEditItem?: (newName: string) => void | Promise<boolean | void>;
  onRemoveItem?: () => void | Promise<void>;
  onEditAnalysisItem: (
    analysisId: string,
    itemType: AnalysisItemType,
    itemIndex: number,
    newName: string,
    analysis: IFormQuestionsAnswersAnalysisBrowseResultModel,
  ) => Promise<void>;
  onRemoveAnalysisItem: (
    analysisId: string,
    itemType: AnalysisItemType,
    itemIndex: number,
    analysis: IFormQuestionsAnswersAnalysisBrowseResultModel,
  ) => Promise<void>;
};

function EditableAnalysisItem({
  item,
  itemIndex,
  analysisId,
  itemType,
  analysis,
  backgroundColor,
  borderColor,
  itemStatus,
  onAddItem,
  isAddingItem,
  addItemLabel = 'Adicionar',
  itemCode,
  readOnly = false,
  onEditItem,
  onRemoveItem,
  onEditAnalysisItem,
  onRemoveAnalysisItem,
}: EditableAnalysisItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.nome);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(item.nome);
    }
  }, [isEditing, item.nome]);

  const handleSave = async () => {
    if (editValue.trim() && editValue !== item.nome) {
      if (onEditItem) {
        const saved = await onEditItem(editValue.trim());
        if (saved === false) return;
      } else {
        await onEditAnalysisItem(
          analysisId,
          itemType,
          itemIndex,
          editValue.trim(),
          analysis,
        );
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(item.nome);
    setIsEditing(false);
  };

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor,
        borderRadius: 1,
        border: '1px solid',
        borderColor,
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '.analysis-item-edit-actions': { opacity: 1 },
        },
        '.analysis-item-add-action': { opacity: 1, visibility: 'visible' },
        '.analysis-item-edit-actions': {
          opacity: 0,
          transition: 'opacity 0.2s ease-in-out',
        },
      }}
    >
      {isEditing ? (
        <SFlex flex={1} gap={1} alignItems="center">
          <TextField
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            multiline
            minRows={1}
            maxRows={4}
            size="small"
            variant="outlined"
            placeholder="Digite o nome do item..."
            autoFocus
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                fontSize: 12,
                fontWeight: 'medium',
              },
            }}
          />
          <SIconButton
            size="small"
            onClick={handleSave}
            iconButtonProps={{ sx: { color: 'success.main' } }}
          >
            <CheckIcon />
          </SIconButton>
          <SIconButton
            size="small"
            onClick={handleCancel}
            iconButtonProps={{ sx: { color: 'error.main' } }}
          >
            <SIconDelete fontSize="16px" />
          </SIconButton>
        </SFlex>
      ) : (
        <SFlex direction="column" gap={1} width="100%">
          <SFlex alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
            <Box
              flex={1}
              minWidth={0}
              onClick={readOnly ? undefined : () => setIsEditing(true)}
              sx={{
                cursor: readOnly ? 'default' : 'pointer',
                '&:hover': readOnly
                  ? undefined
                  : {
                      '& .item-name': {
                        color: 'primary.main',
                      },
                    },
              }}
            >
              <SFlex alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                {itemCode && <AnalysisItemCodeBadge code={itemCode} />}
                <SText
                  className="item-name"
                  variant="body2"
                  fontWeight="medium"
                  fontSize={13}
                  sx={{
                    transition: 'color 0.2s ease-in-out',
                    lineHeight: 1.4,
                  }}
                >
                  {item.nome}
                </SText>
                <AnalysisItemStatusBadges itemStatus={itemStatus} />
              </SFlex>
            </Box>
            <SFlex
              alignItems="center"
              justifyContent="flex-end"
              gap={0.5}
              flexShrink={0}
              flexWrap="wrap"
              onClick={(event) => event.stopPropagation()}
            >
              {!readOnly && (
                <SFlex
                  className="analysis-item-edit-actions"
                  gap={0.5}
                  alignItems="center"
                  flexShrink={0}
                >
                  <SIconButton
                    iconButtonProps={{
                      sx: {
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        },
                      },
                    }}
                    onClick={() => setIsEditing(true)}
                  >
                    <EditIcon fontSize="small" />
                  </SIconButton>
                  <SIconButton
                    iconButtonProps={{
                      sx: {
                        p: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'error.contrastText',
                        },
                      },
                    }}
                    onClick={async () => {
                      if (onRemoveItem) {
                        await onRemoveItem();
                        return;
                      }
                      await onRemoveAnalysisItem(
                        analysisId,
                        itemType,
                        itemIndex,
                        analysis,
                      );
                    }}
                  >
                    <SIconDelete fontSize="16px" />
                  </SIconButton>
                </SFlex>
              )}
              {onAddItem && (
                <Box className="analysis-item-add-action">
                  <SButton
                    variant="contained"
                    color="success"
                    size="s"
                    text={isAddingItem ? 'Adicionando...' : addItemLabel}
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddItem();
                    }}
                    buttonProps={{
                      disabled: isAddingItem,
                      title: itemCode
                        ? `${addItemLabel} (${itemCode})`
                        : addItemLabel,
                      sx: {
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: 'none',
                        opacity: 1,
                        visibility: 'visible',
                      },
                    }}
                  />
                </Box>
              )}
            </SFlex>
          </SFlex>
          {item.justificativa && (
            <Box sx={{ p: 1.5, backgroundColor: 'rgba(0,0,0,0.02)' }}>
              <SText variant="body2" color="text.secondary" fontSize={11}>
                {item.justificativa}
              </SText>
            </Box>
          )}
        </SFlex>
      )}
    </Box>
  );
}

export type RiskEntityAiAnalysisPanelProps = {
  riskId: string;
  analysisKey: string;
  isAnalysisExpanded: boolean;
  onAnalysisToggle: (analysisKey: string) => void;
  sourceAnalysis: IFormQuestionsAnswersAnalysisBrowseResultModel;
  analysis: IFormQuestionsAnswersAnalysisBrowseResultModel;
  displayAnalysisContent: AiRiskAnalysisResponse;
  isHierarchyGroupFallback: boolean;
  showInheritedBanner?: boolean;
  hideBulkApplyButton?: boolean;
  hidePerItemInventoryActions?: boolean;
  applyAnalysisButtonProps?: { text: string; color: 'paper' | 'success' };
  onBulkApplyAnalysis?: () => void;
  resolveDisplayedItemStatus: (
    itemType: AnalysisItemType,
    itemName: string,
    itemIndex: number,
  ) => AnalysisItemInventoryEntry | undefined;
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
  fallbackApplyOptions?: { skipMarkAnalysisApplied?: boolean };
  groupPerItemAdd?: {
    label: string;
    applyingKey: string | null;
    buildApplyingKey: (
      itemType: AnalysisItemType,
      itemIndex: number,
    ) => string;
    isItemAddable: (
      itemType: AnalysisItemType,
      itemName: string,
      itemIndex: number,
    ) => boolean;
    onAdd: (
      itemType: AnalysisItemType,
      itemIndex: number,
      item: { nome: string },
    ) => void | Promise<void>;
  };
};

export function RiskEntityAiAnalysisPanel({
  analysisKey,
  isAnalysisExpanded,
  onAnalysisToggle,
  sourceAnalysis,
  analysis,
  displayAnalysisContent,
  isHierarchyGroupFallback,
  showInheritedBanner = true,
  hideBulkApplyButton = false,
  hidePerItemInventoryActions = false,
  applyAnalysisButtonProps,
  onBulkApplyAnalysis,
  resolveDisplayedItemStatus,
  applyingItemKey,
  buildApplyingItemKey,
  handleAddSingleAnalysisItem,
  handleEditAnalysisItem,
  handleRemoveAnalysisItem,
  createInheritedAnalysisItemEditHandler,
  createInheritedAnalysisItemRemoveHandler,
  fallbackApplyOptions,
  groupPerItemAdd,
}: RiskEntityAiAnalysisPanelProps) {
  const itemCodeRegistry = useMemo(
    () => buildAnalysisItemCodeRegistry(displayAnalysisContent),
    [displayAnalysisContent],
  );

  const resolveItemAddProps = (
    itemType: AnalysisItemType,
    itemIndex: number,
    item: { nome: string },
    canEditContent: boolean,
  ) => {
    if (hidePerItemInventoryActions) {
      return {};
    }

    if (groupPerItemAdd) {
      if (!groupPerItemAdd.isItemAddable(itemType, item.nome, itemIndex)) {
        return {};
      }

      return {
        onAddItem: () => groupPerItemAdd.onAdd(itemType, itemIndex, item),
        addItemLabel: groupPerItemAdd.label,
        isAddingItem:
          groupPerItemAdd.applyingKey ===
          groupPerItemAdd.buildApplyingKey(itemType, itemIndex),
      };
    }

    if (!canEditContent) {
      return {};
    }

    return {
      onAddItem: () =>
        handleAddSingleAnalysisItem(
          analysis,
          itemType,
          itemIndex,
          item,
          fallbackApplyOptions,
        ),
      isAddingItem:
        applyingItemKey ===
        buildApplyingItemKey(sourceAnalysis.id, itemType, itemIndex),
    };
  };

  return (
    <Box mt={3}>
      <SButton
        variant="text"
        text={
          isAnalysisExpanded ? 'Ocultar Análise de IA' : 'Mostrar Análise de IA'
        }
        onClick={() => onAnalysisToggle(analysisKey)}
        buttonProps={{
          sx: {
            mb: 2,
            textDecoration: 'underline',
            '&:hover': { textDecoration: 'underline' },
          },
        }}
      />
      {isAnalysisExpanded && (
        <SFlex direction="column" gap={2}>
          <Box key={sourceAnalysis.id} sx={{ p: 3, backgroundColor: 'primary.50' }}>
            {showInheritedBanner && isHierarchyGroupFallback && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontStyle: 'italic', fontSize: 12 }}
              >
                Análise aplicada pelo agrupamento de setores.
              </Typography>
            )}
            <SFlex alignItems="center" gap={2} mb={2}>
              <SText variant="body2" color="text.main">
                Análise de IA para este risco/setor: {analysis.analysis?.frps}
              </SText>
              <SText
                variant="body2"
                color="text.secondary"
                fontSize={12}
                sx={{ fontStyle: 'italic' }}
              >
                Confiança: {Math.round((sourceAnalysis.confidence ?? 0) * 100)}%
              </SText>
              {!hideBulkApplyButton && applyAnalysisButtonProps && onBulkApplyAnalysis && (
                <SButton
                  variant="shade"
                  color={applyAnalysisButtonProps.color}
                  size="s"
                  text={applyAnalysisButtonProps.text}
                  onClick={onBulkApplyAnalysis}
                  buttonProps={{ sx: { ml: 'auto', fontSize: '0.75rem' } }}
                />
              )}
            </SFlex>

            {displayAnalysisContent.fontesGeradoras?.length > 0 && (
              <Box mb={2} mt={4}>
                <SText variant="body2" fontWeight="bold" fontSize={14} mb={4}>
                  Fontes Geradoras
                </SText>
                <SFlex direction="column" gap={4}>
                  {displayAnalysisContent.fontesGeradoras.map((fonte, index) => {
                    const itemStatus = resolveDisplayedItemStatus(
                      'fontesGeradoras',
                      fonte.nome,
                      index,
                    );
                    const canEditContent = itemStatus?.existsInInventory !== true;
                    const itemAddProps = resolveItemAddProps(
                      'fontesGeradoras',
                      index,
                      fonte,
                      canEditContent,
                    );

                    return (
                      <EditableAnalysisItem
                        key={`fontesGeradoras-${index}`}
                        item={fonte}
                        itemIndex={index}
                        analysisId={sourceAnalysis.id}
                        itemType="fontesGeradoras"
                        itemCode={itemCodeRegistry.getCode('fontesGeradoras', index)}
                        analysis={sourceAnalysis}
                        backgroundColor="grey.50"
                        borderColor="grey.200"
                        itemStatus={itemStatus}
                        readOnly={!canEditContent}
                        onEditItem={
                          isHierarchyGroupFallback && canEditContent
                            ? createInheritedAnalysisItemEditHandler(
                                sourceAnalysis,
                                'fontesGeradoras',
                                index,
                              )
                            : undefined
                        }
                        onRemoveItem={
                          isHierarchyGroupFallback && canEditContent
                            ? createInheritedAnalysisItemRemoveHandler(
                                sourceAnalysis,
                                'fontesGeradoras',
                                index,
                              )
                            : undefined
                        }
                        {...itemAddProps}
                        onEditAnalysisItem={handleEditAnalysisItem}
                        onRemoveAnalysisItem={handleRemoveAnalysisItem}
                      />
                    );
                  })}
                </SFlex>
              </Box>
            )}

            {displayAnalysisContent.medidasEngenhariaRecomendadas?.length > 0 && (
              <Box mb={2} mt={8}>
                <SText variant="body2" fontWeight="bold" fontSize={14} mb={2}>
                  Recomendações (Medidas de Engenharia)
                </SText>
                <SFlex direction="column" gap={1}>
                  {displayAnalysisContent.medidasEngenhariaRecomendadas.map(
                    (medida, index) => {
                      const itemStatus = resolveDisplayedItemStatus(
                        'medidasEngenhariaRecomendadas',
                        medida.nome,
                        index,
                      );
                      const canEditContent = itemStatus?.existsInInventory !== true;
                      const itemAddProps = resolveItemAddProps(
                        'medidasEngenhariaRecomendadas',
                        index,
                        medida,
                        canEditContent,
                      );

                      return (
                        <EditableAnalysisItem
                          key={`medidasEngenhariaRecomendadas-${index}`}
                          item={medida}
                          itemIndex={index}
                          analysisId={sourceAnalysis.id}
                          itemType="medidasEngenhariaRecomendadas"
                          itemCode={itemCodeRegistry.getCode(
                            'medidasEngenhariaRecomendadas',
                            index,
                          )}
                          analysis={sourceAnalysis}
                          backgroundColor="grey.50"
                          borderColor="grey.200"
                          itemStatus={itemStatus}
                          readOnly={!canEditContent}
                          onEditItem={
                            isHierarchyGroupFallback && canEditContent
                              ? createInheritedAnalysisItemEditHandler(
                                  sourceAnalysis,
                                  'medidasEngenhariaRecomendadas',
                                  index,
                                )
                              : undefined
                          }
                          onRemoveItem={
                            isHierarchyGroupFallback && canEditContent
                              ? createInheritedAnalysisItemRemoveHandler(
                                  sourceAnalysis,
                                  'medidasEngenhariaRecomendadas',
                                  index,
                                )
                              : undefined
                          }
                          {...itemAddProps}
                          onEditAnalysisItem={handleEditAnalysisItem}
                          onRemoveAnalysisItem={handleRemoveAnalysisItem}
                        />
                      );
                    },
                  )}
                </SFlex>
              </Box>
            )}

            {displayAnalysisContent.medidasAdministrativasRecomendadas?.length >
              0 && (
              <Box mt={8}>
                <SText variant="body2" fontWeight="bold" fontSize={14} mb={2}>
                  Recomendações (Medidas Administrativas)
                </SText>
                <SFlex direction="column" gap={1}>
                  {displayAnalysisContent.medidasAdministrativasRecomendadas.map(
                    (medida, index) => {
                      const itemStatus = resolveDisplayedItemStatus(
                        'medidasAdministrativasRecomendadas',
                        medida.nome,
                        index,
                      );
                      const canEditContent = itemStatus?.existsInInventory !== true;
                      const itemAddProps = resolveItemAddProps(
                        'medidasAdministrativasRecomendadas',
                        index,
                        medida,
                        canEditContent,
                      );

                      return (
                        <EditableAnalysisItem
                          key={`medidasAdministrativasRecomendadas-${index}`}
                          item={medida}
                          itemIndex={index}
                          analysisId={sourceAnalysis.id}
                          itemType="medidasAdministrativasRecomendadas"
                          itemCode={itemCodeRegistry.getCode(
                            'medidasAdministrativasRecomendadas',
                            index,
                          )}
                          analysis={sourceAnalysis}
                          backgroundColor="grey.50"
                          borderColor="grey.200"
                          itemStatus={itemStatus}
                          readOnly={!canEditContent}
                          onEditItem={
                            isHierarchyGroupFallback && canEditContent
                              ? createInheritedAnalysisItemEditHandler(
                                  sourceAnalysis,
                                  'medidasAdministrativasRecomendadas',
                                  index,
                                )
                              : undefined
                          }
                          onRemoveItem={
                            isHierarchyGroupFallback && canEditContent
                              ? createInheritedAnalysisItemRemoveHandler(
                                  sourceAnalysis,
                                  'medidasAdministrativasRecomendadas',
                                  index,
                                )
                              : undefined
                          }
                          {...itemAddProps}
                          onEditAnalysisItem={handleEditAnalysisItem}
                          onRemoveAnalysisItem={handleRemoveAnalysisItem}
                        />
                      );
                    },
                  )}
                </SFlex>
              </Box>
            )}
          </Box>
        </SFlex>
      )}
    </Box>
  );
}
