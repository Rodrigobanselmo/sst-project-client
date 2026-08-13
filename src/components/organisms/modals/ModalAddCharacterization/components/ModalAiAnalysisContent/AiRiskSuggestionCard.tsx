import React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RecommendIcon from '@mui/icons-material/Recommend';
import SourceIcon from '@mui/icons-material/Source';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import { getAiRiskProbabilityColor } from './get-ai-risk-probability-color.util';
import { mapAiRiskTypeToEnum } from './map-ai-risk-type-to-enum.util';
import type { AiRiskSuggestionEdits } from './useAiRiskSuggestionEdits';
import {
  AiRiskRemovableTag,
  AiRiskSectionHeader,
} from './AiRiskSuggestionPrimitives';

export type AiRiskSuggestionCardProps = {
  risk: DetailedRisk;
  isAdded: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onDismiss: () => void;
  onAdd: () => void;
  edits: AiRiskSuggestionEdits;
};

export function AiRiskSuggestionCard({
  risk,
  isAdded,
  expanded,
  onExpandedChange,
  onDismiss,
  onAdd,
  edits,
}: AiRiskSuggestionCardProps) {
  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      sx={{
        border: '1px solid',
        borderColor: isAdded ? 'success.main' : 'divider',
        borderRadius: 1,
        mb: 2,
        '&:before': { display: 'none' },
        boxShadow: isAdded ? '0 2px 8px rgba(76, 175, 80, 0.2)' : 1,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: 'background.paper',
          '&.Mui-expanded': {
            minHeight: 48,
          },
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
          },
        }}
      >
        <SFlex
          direction="row"
          alignItems="center"
          gap={2}
          sx={{ width: '100%' }}
        >
          <SFlex
            direction="row"
            alignItems="flex-start"
            gap={2}
            sx={{ flex: 1 }}
          >
            {isAdded && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                ✓
              </Box>
            )}
            <SRiskChip type={mapAiRiskTypeToEnum(risk.type)} size="lg" />
            <SText
              variant="subtitle2"
              sx={{ fontWeight: isAdded ? 600 : 500 }}
            >
              {risk.name}
            </SText>
          </SFlex>
          <SButton
            text="Remover da lista"
            variant="shade"
            color="danger"
            size="s"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss();
            }}
            buttonProps={{
              sx: {
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                mr: 1,
                fontSize: '0.75rem',
              },
            }}
          />
          <SButton
            text={isAdded ? '✓ Adicionado' : 'Adicionar Risco'}
            variant={isAdded ? 'contained' : 'shade'}
            color="success"
            size="s"
            disabled={isAdded}
            onClick={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            buttonProps={{
              sx: {
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                mr: 5,
                fontSize: '0.75rem',
              },
            }}
          />
        </SFlex>
      </AccordionSummary>
      <AccordionDetails>
        <SFlex direction="column" gap={2}>
          <Box>
            <SText variant="body2" color="text.primary">
              <strong>Explicação:</strong>
            </SText>
            <SText variant="body2" color="text.secondary">
              {risk.explanation}
            </SText>
            <SText
              variant="body2"
              color="text.secondary"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.8rem',
                mt: 1,
                opacity: 0.8,
              }}
            >
              *A IA tem {Math.round(risk.confidence * 100)}% de confiança nesta
              análise.
            </SText>
          </Box>

          <Box>
            <AiRiskSectionHeader
              variant="primary"
              icon={<AssessmentIcon sx={{ fontSize: 18 }} />}
            >
              Probabilidade
            </AiRiskSectionHeader>
            <SFlex direction="row" alignItems="center" gap={2} sx={{ mt: 1 }}>
              <SFlex direction="row" gap={0.5}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <Box
                    key={level}
                    onClick={() => edits.editProbability(risk.id, level)}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor:
                        risk.probability == level
                          ? getAiRiskProbabilityColor(level)
                          : 'grey.200',
                      border: '2px solid',
                      borderColor:
                        risk.probability == level
                          ? getAiRiskProbabilityColor(level)
                          : 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: risk.probability == level ? 'white' : 'grey.500',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    {level}
                  </Box>
                ))}
              </SFlex>
            </SFlex>
          </Box>

          {risk.generateSource && (
            <Box>
              <AiRiskSectionHeader
                variant="primary"
                icon={<SourceIcon sx={{ fontSize: 15 }} />}
              >
                Fonte Geradora
              </AiRiskSectionHeader>
              <AiRiskRemovableTag
                label={risk.generateSource}
                onRemove={() => edits.removeGenerateSource(risk.id)}
                onEdit={(newValue) => edits.editGenerateSource(risk.id, newValue)}
              />
            </Box>
          )}

          {(risk.existingEngineeringMeasures.length > 0 ||
            risk.existingAdministrativeMeasures.length > 0) && (
            <Box>
              <AiRiskSectionHeader
                variant="primary"
                icon={<AdminPanelSettingsIcon sx={{ fontSize: 15 }} />}
              >
                Controles Existentes
              </AiRiskSectionHeader>
              {risk.existingEngineeringMeasures.length > 0 && (
                <Box mb={4}>
                  <AiRiskSectionHeader variant="secondary">
                    Medidas de Engenharia
                  </AiRiskSectionHeader>
                  <SFlex direction="column" gap={2}>
                    {risk.existingEngineeringMeasures.map((measure, idx) => (
                      <AiRiskRemovableTag
                        key={idx}
                        label={measure}
                        onRemove={() =>
                          edits.removeExistingEngineeringMeasure(risk.id, idx)
                        }
                        onEdit={(newValue) =>
                          edits.editExistingEngineeringMeasure(
                            risk.id,
                            idx,
                            newValue,
                          )
                        }
                      />
                    ))}
                  </SFlex>
                </Box>
              )}
              {risk.existingAdministrativeMeasures.length > 0 && (
                <Box mb={4}>
                  <AiRiskSectionHeader variant="secondary">
                    Medidas Administrativas
                  </AiRiskSectionHeader>
                  <SFlex direction="column" gap={2}>
                    {risk.existingAdministrativeMeasures.map((measure, idx) => (
                      <AiRiskRemovableTag
                        key={idx}
                        label={measure}
                        onRemove={() =>
                          edits.removeExistingAdministrativeMeasure(
                            risk.id,
                            idx,
                          )
                        }
                        onEdit={(newValue) =>
                          edits.editExistingAdministrativeMeasure(
                            risk.id,
                            idx,
                            newValue,
                          )
                        }
                      />
                    ))}
                  </SFlex>
                </Box>
              )}
            </Box>
          )}

          {(risk.recommendedEngineeringMeasures.length > 0 ||
            risk.recommendedAdministrativeMeasures.length > 0) && (
            <Box>
              <AiRiskSectionHeader
                variant="primary"
                icon={<RecommendIcon sx={{ fontSize: 15 }} />}
              >
                Medidas Recomendadas
              </AiRiskSectionHeader>
              {risk.recommendedEngineeringMeasures.length > 0 && (
                <Box mb={2}>
                  <AiRiskSectionHeader variant="secondary">
                    Medidas de Engenharia
                  </AiRiskSectionHeader>
                  <SFlex direction="column" gap={2}>
                    {risk.recommendedEngineeringMeasures.map((measure, idx) => (
                      <AiRiskRemovableTag
                        key={idx}
                        label={measure}
                        onRemove={() =>
                          edits.removeRecommendedEngineeringMeasure(
                            risk.id,
                            idx,
                          )
                        }
                        onEdit={(newValue) =>
                          edits.editRecommendedEngineeringMeasure(
                            risk.id,
                            idx,
                            newValue,
                          )
                        }
                      />
                    ))}
                  </SFlex>
                </Box>
              )}
              {risk.recommendedAdministrativeMeasures.length > 0 && (
                <Box mb={2}>
                  <AiRiskSectionHeader variant="secondary">
                    Medidas Administrativas
                  </AiRiskSectionHeader>
                  <SFlex direction="column" gap={2}>
                    {risk.recommendedAdministrativeMeasures.map(
                      (measure, idx) => (
                        <AiRiskRemovableTag
                          key={idx}
                          label={measure}
                          onRemove={() =>
                            edits.removeRecommendedAdministrativeMeasure(
                              risk.id,
                              idx,
                            )
                          }
                          onEdit={(newValue) =>
                            edits.editRecommendedAdministrativeMeasure(
                              risk.id,
                              idx,
                              newValue,
                            )
                          }
                        />
                      ),
                    )}
                  </SFlex>
                </Box>
              )}
            </Box>
          )}
        </SFlex>
      </AccordionDetails>
    </Accordion>
  );
}
