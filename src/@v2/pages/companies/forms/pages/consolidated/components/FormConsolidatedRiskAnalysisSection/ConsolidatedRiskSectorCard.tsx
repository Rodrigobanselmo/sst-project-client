import { useState } from 'react';

import { Box, Chip, Typography } from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ConsolidatedViewRiskAnalysisItemModel } from '@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { FrpsMatrixEquation } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/FrpsMatrixEquation';
import { resolveOccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

import { ConsolidatedRiskAiAnalysisPanel } from './ConsolidatedRiskAiAnalysisPanel';

type Props = {
  item: ConsolidatedViewRiskAnalysisItemModel;
};

export function ConsolidatedRiskSectorCard({ item }: Props) {
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  const occupationalLevel = resolveOccupationalRiskLevel(
    item.severity ?? undefined,
    item.probability ?? undefined,
  );
  const hasAiAnalysis =
    Boolean(item.aiAnalysis) &&
    (Boolean(item.aiAnalysis?.fontesGeradoras.length) ||
      Boolean(item.aiAnalysis?.medidasEngenhariaRecomendadas.length) ||
      Boolean(item.aiAnalysis?.medidasAdministrativasRecomendadas.length) ||
      Boolean(item.aiAnalysis?.frps));

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.200',
      }}
    >
      <SFlex alignItems="flex-start" gap={2} flexWrap="wrap" mb={1.5}>
        <SFlex direction="column" gap={1} flex={1} minWidth={220}>
          <SFlex alignItems="center" gap={1} flexWrap="wrap">
            <Box
              sx={{
                backgroundColor: 'grey.100',
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography fontSize={12} color="text.secondary">
                {hierarchyTypeTranslation[item.hierarchyType as HierarchyTypeEnum] ??
                  'Setor'}
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={600}>
              {item.sectorName}
            </Typography>
          </SFlex>

          <SFlex gap={0.75} flexWrap="wrap">
            <Chip size="small" variant="outlined" label={item.companyName} />
            <Chip size="small" variant="outlined" label={item.applicationName} />
            {item.establishmentName && (
              <Chip
                size="small"
                variant="outlined"
                label={item.establishmentName}
              />
            )}
            {item.inInventory && (
              <Chip size="small" color="success" variant="outlined" label="No inventário" />
            )}
          </SFlex>

          <Typography variant="caption" color="text.secondary">
            Status: {item.status || 'Sem análise registrada'}
          </Typography>
        </SFlex>

        <SFlex gap={1} flexWrap="wrap" alignItems="center">
          <FrpsMatrixEquation
            probability={item.probability}
            severity={item.severity}
            resultLevel={occupationalLevel}
            riskType={item.riskType}
          />
        </SFlex>
      </SFlex>

      {hasAiAnalysis && (
        <>
          <SButton
            variant="text"
            text={
              showAiAnalysis ? 'Ocultar Análise de IA' : 'Mostrar Análise de IA'
            }
            onClick={() => setShowAiAnalysis((current) => !current)}
            buttonProps={{
              sx: {
                mb: showAiAnalysis ? 1.5 : 0,
                textDecoration: 'underline',
                '&:hover': { textDecoration: 'underline' },
              },
            }}
          />
          {showAiAnalysis && item.aiAnalysis && (
            <ConsolidatedRiskAiAnalysisPanel
              aiAnalysis={item.aiAnalysis}
              riskFactor={item.riskFactor}
            />
          )}
        </>
      )}
    </Box>
  );
}
