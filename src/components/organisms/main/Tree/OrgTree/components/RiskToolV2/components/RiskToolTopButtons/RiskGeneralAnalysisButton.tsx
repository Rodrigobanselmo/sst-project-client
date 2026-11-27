import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { Box, Button } from '@mui/material';
import STooltip from 'components/atoms/STooltip';
import { riskEditorActionSx } from 'configs/theme/risk-editor-action';
import { useRiskFactorsAiOptional } from '../../risk-factors-ai/RiskFactorsAiProvider';

export function RiskGeneralAnalysisButton() {
  const ai = useRiskFactorsAiOptional();
  if (!ai?.openGeneral) return null;
  return (
    <STooltip
      withWrapper
      title={
        <Box sx={{ maxWidth: 330 }}>
          <Box component="strong" sx={{ display: 'block', mb: 3 }}>
            Análise geral com IA
          </Box>
          Analisa o contexto de forma ampla e pode propor vários fatores de
          risco, fontes geradoras, medidas de controle e recomendações. Os
          campos sugeridos dependem dos dados disponíveis e do escopo da
          análise. Revise as sugestões antes de aplicá-las.
        </Box>
      }
    >
      <Button
        type="button"
        variant="outlined"
        size="small"
        startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />}
        sx={riskEditorActionSx}
        onClick={ai.openGeneral}
      >
        Análise geral com IA
      </Button>
    </STooltip>
  );
}
