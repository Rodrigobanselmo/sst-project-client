import React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import type {
  AiRiskFieldSuggestion,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import {
  buildModularSuggestionKey,
  getFieldChipColor,
  getFieldLabel,
  getSuggestionValues,
  groupReviewSuggestions,
} from './ai-risk-field-suggestion.util';

export type AiExistingRiskReviewCardProps = {
  review: ExistingRiskReview;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  appliedKeys: Set<string>;
  applyingKey: string | null;
  onApply: (params: {
    review: ExistingRiskReview;
    suggestion: AiRiskFieldSuggestion;
    value: string | number;
  }) => void;
};

export function AiExistingRiskReviewCard({
  review,
  expanded,
  onExpandedChange,
  appliedKeys,
  applyingKey,
  onApply,
}: AiExistingRiskReviewCardProps) {
  const accordionId = `review:${review.riskId}`;

  return (
    <Accordion
      key={accordionId}
      disableGutters
      expanded={expanded}
      onChange={(_, isExpanded) => onExpandedChange(isExpanded)}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:before': { display: 'none' },
        boxShadow: 'none',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <SFlex
          direction="row"
          alignItems="center"
          gap={2}
          sx={{ width: '100%', pr: 1 }}
        >
          <SFlex
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ flex: 1, minWidth: 0 }}
          >
            {review.type && (
              <SRiskChip type={review.type as unknown as RiskTypeEnum} />
            )}
            <SText variant="body2" color="text.primary">
              {review.name}
            </SText>
          </SFlex>
          <Chip
            size="small"
            label="Já caracterizado"
            color="default"
            variant="outlined"
          />
          <Chip
            size="small"
            label="Sugestão IA"
            color="info"
            variant="outlined"
          />
        </SFlex>
      </AccordionSummary>
      <AccordionDetails>
        <SFlex direction="column" gap={2.5}>
          {groupReviewSuggestions(review).map((group) => (
            <Box key={group.categoryId}>
              <SText variant="subtitle2" color="text.primary" mb={1}>
                {group.title}
              </SText>
              <SFlex direction="column" gap={1.5}>
                {group.subgroups.map((subgroup) => (
                  <Box key={`${review.riskId}:${subgroup.field}`}>
                    <Chip
                      size="small"
                      label={getFieldLabel(subgroup.field)}
                      color={getFieldChipColor(subgroup.field)}
                      variant="outlined"
                      sx={{ mb: 0.75 }}
                    />
                    <SFlex direction="column" gap={1}>
                      {subgroup.suggestions.flatMap((suggestion) =>
                        getSuggestionValues(suggestion).map((value) => {
                          const key = buildModularSuggestionKey(
                            review.riskId,
                            suggestion.field,
                            value,
                          );
                          const isApplied = appliedKeys.has(key);
                          const isObservation =
                            suggestion.field === 'observation';
                          const isProbability =
                            suggestion.field === 'probability';
                          const currentLabel = Array.isArray(
                            suggestion.currentValues,
                          )
                            ? suggestion.currentValues.join(', ') || '—'
                            : suggestion.currentValues ?? '—';

                          return (
                            <Box
                              key={key}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                p: 1.5,
                              }}
                            >
                              <SFlex
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                gap={2}
                                sx={{ flexWrap: 'wrap' }}
                              >
                                <SFlex
                                  direction="column"
                                  gap={0.5}
                                  sx={{ flex: 1, minWidth: 0 }}
                                >
                                  {isApplied && (
                                    <Chip
                                      size="small"
                                      label="Aplicado"
                                      color="success"
                                      variant="outlined"
                                      sx={{ alignSelf: 'flex-start' }}
                                    />
                                  )}
                                  <SText
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Valor atual: {String(currentLabel)}
                                  </SText>
                                  <SText variant="body2" color="text.primary">
                                    Sugerido: {String(value)}
                                  </SText>
                                  {suggestion.rationale && (
                                    <SText
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {suggestion.rationale}
                                    </SText>
                                  )}
                                  {isProbability && (
                                    <SText
                                      variant="caption"
                                      color="warning.main"
                                    >
                                      Aplicar probabilidade sobrescreve o valor
                                      atual.
                                    </SText>
                                  )}
                                </SFlex>
                                {!isObservation && (
                                  <SButton
                                    text={isApplied ? 'Aplicado' : 'Aplicar'}
                                    variant={isApplied ? 'shade' : 'outlined'}
                                    color="primary"
                                    size="s"
                                    disabled={
                                      isApplied || applyingKey === key
                                    }
                                    loading={applyingKey === key}
                                    onClick={() =>
                                      onApply({
                                        review,
                                        suggestion,
                                        value,
                                      })
                                    }
                                    buttonProps={{ sx: { minWidth: 'auto' } }}
                                  />
                                )}
                              </SFlex>
                            </Box>
                          );
                        }),
                      )}
                    </SFlex>
                  </Box>
                ))}
              </SFlex>
            </Box>
          ))}
        </SFlex>
      </AccordionDetails>
    </Accordion>
  );
}
