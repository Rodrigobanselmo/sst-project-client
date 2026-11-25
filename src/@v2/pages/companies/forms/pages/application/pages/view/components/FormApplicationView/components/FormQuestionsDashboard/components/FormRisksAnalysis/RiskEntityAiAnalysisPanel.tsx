import {
  AnalysisDisclosureHeader,
  AnalysisItemsSection,
} from './AnalysisDisclosure';
import Tooltip from '@mui/material/Tooltip';
import {
  analysisItemPillSchema,
  analysisItemPillSx,
} from './analysis-item-pill.styles';
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
import {
  FrpsAnalysisItemReviewActions,
  useCanEditFrpsAnalysisContent,
} from './FrpsAnalysisItemReviewActions';
import {
  ExplainFrpsItemButton,
  buildCatalogFrpsItemKey,
  mapAnalysisListItemTypeToExplanationItemType,
} from './frps-explainability';
import {
  buildAnalysisItemCodeRegistry,
  type AnalysisItemCodeType,
} from '../../helpers/analysis-item-codes.utils';

type AnalysisItemType = AnalysisItemCodeType;

type EditableAnalysisItemProps = {
  item: {
    nome: string;
    justificativa?: string;
    catalogId?: string | null;
    reviewItemId?: string | null;
  };
  reviewCompanyId?: string;
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
  reviewCompanyId,
}: EditableAnalysisItemProps) {
  const canEditAnalysisContent = useCanEditFrpsAnalysisContent();
  const allowContentEdit = !readOnly && canEditAnalysisContent;
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
        backgroundColor: 'transparent',
        borderRadius: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 'none',
          '.analysis-item-edit-actions': { opacity: 1 },
        },
        '.analysis-item-add-action': { opacity: 1, visibility: 'visible' },
        '.analysis-item-edit-actions': {
          opacity: 1,
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
          <SFlex
            alignItems="center"
            justifyContent="space-between"
            gap={1}
            flexWrap="wrap"
          >
            <Box
              flex={1}
              minWidth={0}
              sx={{
                cursor: allowContentEdit ? 'pointer' : 'default',
                '&:hover': allowContentEdit
                  ? {
                      '& .item-name': {
                        color: (theme) => theme.palette.mode === 'light' ? '#1565C0' : theme.palette.text.primary,
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                      },
                    }
                  : undefined,
              }}
            >
              <SFlex alignItems="center" gap={1} flexWrap="wrap" mb={0.5}>
                <Tooltip
                  arrow
                  title={
                    <Box>
                      {allowContentEdit && (
                        <Box sx={{ fontWeight: 600, mb: 1 }}>
                          Clique para editar
                        </Box>
                      )}
                      {item.justificativa && (
                            <Box sx={{ mt: allowContentEdit ? 4 : 0, lineHeight: 1.6 }}>
                              <Box sx={{ fontWeight: 700, mb: 1 }}>Justificativa:</Box>
                              <Box>{item.justificativa}</Box>
                            </Box>
                          )}
                    </Box>
                  }
                >
                  <SText
                    className="item-name"
                    onClick={
                      allowContentEdit ? () => setIsEditing(true) : undefined
                    }
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        allowContentEdit &&
                        (event.key === 'Enter' || event.key === ' ')
                      ) {
                        event.preventDefault();
                        setIsEditing(true);
                      }
                    }}
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
                </Tooltip>
                <AnalysisItemStatusBadges itemStatus={itemStatus} />
                <ExplainFrpsItemButton
                  analysisId={analysisId}
                  listItemType={itemType}
                  itemName={item.nome}
                  itemKey={
                    item.catalogId || itemStatus?.catalogId
                      ? buildCatalogFrpsItemKey(
                          mapAnalysisListItemTypeToExplanationItemType(
                            itemType,
                          ),
                          (item.catalogId || itemStatus?.catalogId) as string,
                        )
                      : undefined
                  }
                  riskFactorName={analysis.analysis?.frps}
                />
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
              <FrpsAnalysisItemReviewActions
                companyId={reviewCompanyId || analysis.companyId}
                applicationId={analysis.formApplicationId}
                analysisId={analysisId}
                itemType={itemType}
                itemIndex={itemIndex}
                item={item}
                reviews={analysis.itemReviews}
              />
              {allowContentEdit && (
                <SFlex
                  className="analysis-item-edit-actions"
                  gap={0.5}
                  alignItems="center"
                  flexShrink={0}
                >
                  <SIconButton
                    iconButtonProps={{
                      'aria-label': 'Editar item',
                      sx: {
                        p: 0.5,
                        borderRadius: 1,
                        color: 'text.secondary',
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
                      'aria-label': 'Excluir item',
                      sx: {
                        p: 0.5,
                        borderRadius: 1,
                        color: 'text.secondary',
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
              {onAddItem && !itemStatus?.existsInInventory && (
                <Box className="analysis-item-add-action">
                  <SButton
                    variant="contained"
                    color="success"
                    size="s"
                    schema={analysisItemPillSchema}
                    textProps={{ fontSize: 11, fontWeight: 500 }}
                    text={
                      isAddingItem ? 'Adicionando...' : 'Aceitar e adicionar'
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddItem();
                    }}
                    buttonProps={{
                      disabled: isAddingItem,
                      title: itemCode
                        ? `${addItemLabel} (${itemCode})`
                        : addItemLabel,
                      sx: analysisItemPillSx,
                    }}
                  />
                </Box>
              )}
            </SFlex>
          </SFlex>
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
  reviewCompanyId?: string;
  groupPerItemAdd?: {
    label: string;
    applyingKey: string | null;
    buildApplyingKey: (itemType: AnalysisItemType, itemIndex: number) => string;
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
  reviewCompanyId,
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
      <AnalysisDisclosureHeader
        expanded={isAnalysisExpanded}
        onToggle={() => onAnalysisToggle(analysisKey)}
        confidence={sourceAnalysis.confidence}
        action={
          !hideBulkApplyButton &&
          applyAnalysisButtonProps &&
          onBulkApplyAnalysis && (
            <SButton
              variant="shade"
              schema={analysisItemPillSchema}
              textProps={{ fontSize: 11 }}
              size="s"
              text={
                'Aceitar e adicionar todos deste risco/setor'
              }
              tooltip="Aceitar e adicionar todas as fontes e recomendações deste risco no destino indicado"
              onClick={onBulkApplyAnalysis}
              buttonProps={{ sx: analysisItemPillSx }}
            />
          )
        }
      />
      {isAnalysisExpanded && (
        <SFlex direction="column" gap={2}>
          <Box
            key={sourceAnalysis.id}
            sx={{ p: 3, backgroundColor: 'transparent' }}
          >
            {showInheritedBanner && isHierarchyGroupFallback && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, fontStyle: 'italic', fontSize: 12 }}
              >
                Análise aplicada pelo agrupamento de setores.
              </Typography>
            )}

            {displayAnalysisContent.fontesGeradoras?.length > 0 && (
              <AnalysisItemsSection title="Fontes Geradoras">
                <SFlex direction="column" gap={4}>
                  {displayAnalysisContent.fontesGeradoras.map(
                    (fonte, index) => {
                      const itemStatus = resolveDisplayedItemStatus(
                        'fontesGeradoras',
                        fonte.nome,
                        index,
                      );
                      const canEditContent =
                        itemStatus?.existsInInventory !== true;
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
                          itemCode={itemCodeRegistry.getCode(
                            'fontesGeradoras',
                            index,
                          )}
                          analysis={sourceAnalysis}
                          reviewCompanyId={reviewCompanyId}
                          backgroundColor="background.paper"
                          borderColor="divider"
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
                    },
                  )}
                </SFlex>
              </AnalysisItemsSection>
            )}

            {displayAnalysisContent.medidasEngenhariaRecomendadas?.length >
              0 && (
              <AnalysisItemsSection title="Recomendações (Medidas de Engenharia)">
                <SFlex direction="column" gap={1}>
                  {displayAnalysisContent.medidasEngenhariaRecomendadas.map(
                    (medida, index) => {
                      const itemStatus = resolveDisplayedItemStatus(
                        'medidasEngenhariaRecomendadas',
                        medida.nome,
                        index,
                      );
                      const canEditContent =
                        itemStatus?.existsInInventory !== true;
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
                          reviewCompanyId={reviewCompanyId}
                          backgroundColor="background.paper"
                          borderColor="divider"
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
              </AnalysisItemsSection>
            )}

            {displayAnalysisContent.medidasAdministrativasRecomendadas?.length >
              0 && (
              <AnalysisItemsSection title="Recomendações (Medidas Administrativas)">
                <SFlex direction="column" gap={1}>
                  {displayAnalysisContent.medidasAdministrativasRecomendadas.map(
                    (medida, index) => {
                      const itemStatus = resolveDisplayedItemStatus(
                        'medidasAdministrativasRecomendadas',
                        medida.nome,
                        index,
                      );
                      const canEditContent =
                        itemStatus?.existsInInventory !== true;
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
                          reviewCompanyId={reviewCompanyId}
                          backgroundColor="background.paper"
                          borderColor="divider"
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
              </AnalysisItemsSection>
            )}
          </Box>
        </SFlex>
      )}
    </Box>
  );
}
