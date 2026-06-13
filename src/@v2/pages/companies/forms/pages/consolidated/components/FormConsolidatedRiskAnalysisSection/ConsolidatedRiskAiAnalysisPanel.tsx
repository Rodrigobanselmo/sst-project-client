import { Box, Chip, Typography } from '@mui/material';

import { ConsolidatedViewRiskAnalysisAiItemModel } from '@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import SText from 'components/atoms/SText';

type Props = {
  aiAnalysis: NonNullable<
    import('@v2/models/enterprise/company-group/consolidated-view-risk-analysis.model').ConsolidatedViewRiskAnalysisAiAnalysisModel
  >;
  riskFactor: string;
};

function ReadOnlyAnalysisItems(props: {
  title: string;
  items: ConsolidatedViewRiskAnalysisAiItemModel[];
}) {
  if (props.items.length === 0) return null;

  return (
    <Box>
      <SText fontSize={13} fontWeight={600} mb={1}>
        {props.title}
      </SText>
      <SFlex direction="column" gap={1.5}>
        {props.items.map((item, index) => (
          <Box
            key={`${item.nome}-${index}`}
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
              backgroundColor: 'common.white',
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {item.nome}
            </Typography>
            {item.justificativa && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {item.justificativa}
              </Typography>
            )}
          </Box>
        ))}
      </SFlex>
    </Box>
  );
}

export function ConsolidatedRiskAiAnalysisPanel({ aiAnalysis, riskFactor }: Props) {
  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: 'primary.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'primary.100',
      }}
    >
      <SFlex alignItems="center" gap={1} flexWrap="wrap" mb={1.5}>
        <SText variant="body2" color="text.main">
          Análise de IA existente para {riskFactor}
          {aiAnalysis.frps ? `: ${aiAnalysis.frps}` : ''}
        </SText>
        {aiAnalysis.confidence != null && (
          <Typography variant="caption" color="text.secondary" fontStyle="italic">
            Confiança: {Math.round(aiAnalysis.confidence * 100)}%
          </Typography>
        )}
        <Chip size="small" variant="outlined" label="Somente leitura" />
      </SFlex>

      <SFlex direction="column" gap={2}>
        <ReadOnlyAnalysisItems
          title="Fontes geradoras"
          items={aiAnalysis.fontesGeradoras}
        />
        <ReadOnlyAnalysisItems
          title="Medidas de engenharia recomendadas"
          items={aiAnalysis.medidasEngenhariaRecomendadas}
        />
        <ReadOnlyAnalysisItems
          title="Medidas administrativas recomendadas"
          items={aiAnalysis.medidasAdministrativasRecomendadas}
        />
      </SFlex>
    </Box>
  );
}
