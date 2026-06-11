import { Alert, AlertTitle, Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import { EffectivenessStatusEnum } from '@v2/models/security/enums/effectiveness-status.enum';

const RECOMMENDED_STEPS = [
  'Reprogramar prazo/responsável da ação;',
  'Revisar a medida de controle;',
  'Criar ação complementar;',
  'Reavaliar o risco residual, se aplicável.',
] as const;

export const isEffectivenessRequiringCorrection = (
  status?: EffectivenessStatusEnum,
) =>
  status === EffectivenessStatusEnum.INEFFECTIVE ||
  status === EffectivenessStatusEnum.PARTIALLY_EFFECTIVE;

export const ActionPlanMeasureCorrectionAlert = () => (
  <Alert severity="warning" sx={{ mt: 6 }}>
    <AlertTitle sx={{ fontWeight: 600 }}>Medida requer correção</AlertTitle>
    <SText fontSize={14}>
      O acompanhamento indicou que a medida não foi plenamente eficaz. Avalie
      reprogramar a ação, revisar a medida de controle, criar nova ação
      complementar ou reavaliar o risco residual.
    </SText>
    <Box component="ol" sx={{ mt: 3, mb: 0, pl: 5 }}>
      {RECOMMENDED_STEPS.map((step) => (
        <Box component="li" key={step} sx={{ mb: 1 }}>
          <SText fontSize={14}>{step}</SText>
        </Box>
      ))}
    </Box>
  </Alert>
);
