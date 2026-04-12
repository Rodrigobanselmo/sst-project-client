import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import type { IFormParticipantsFilterSummary } from '@v2/models/form/models/form-participants/form-participants-browse.model';
import { Box, LinearProgress, Typography } from '@mui/material';

type Props = {
  summary: IFormParticipantsFilterSummary;
  isLoading?: boolean;
};

export const FormParticipantsFilterSummary = ({ summary, isLoading }: Props) => {
  const pct = summary.responseRatePercent;
  const barPct = Math.min(100, Math.max(0, pct));
  const barColor = getResponseRateBarColor(pct);

  return (
    <SPaper
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: 'grey.300',
        backgroundColor: 'grey.50',
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
        Resumo do recorte filtrado
      </Typography>
      {isLoading ? (
        <SText color="text.secondary">Carregando indicadores…</SText>
      ) : (
        <Box maxWidth={720} mx="auto">
          <Typography
            variant="body2"
            textAlign="center"
            color="warning.main"
            fontWeight={600}
            mb={1}
          >
            Taxa de resposta no recorte
          </Typography>
          <Box width="100%" mb={1}>
            <LinearProgress
              variant="determinate"
              value={barPct}
              sx={{
                height: 20,
                borderRadius: 10,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: barColor,
                  borderRadius: 10,
                },
              }}
            />
            <Typography
              variant="h4"
              textAlign="center"
              mt={2}
              sx={{ color: barColor, fontWeight: 700 }}
            >
              {pct.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}
              %
            </Typography>
            <Typography variant="body2" textAlign="center" color="text.secondary" mt={1}>
              Total: {summary.totalParticipants} participantes | Responderam:{' '}
              {summary.respondedCount} | Não responderam: {summary.notRespondedCount}
            </Typography>
          </Box>
          <SFlex gap={3} flexWrap="wrap" justifyContent="center" mt={2}>
            <Box textAlign="center">
              <SText fontSize={11} color="grey.600">
                Participantes
              </SText>
              <Typography variant="h6" component="span">
                {summary.totalParticipants}
              </Typography>
            </Box>
            <Box textAlign="center">
              <SText fontSize={11} color="grey.600">
                Responderam
              </SText>
              <Typography variant="h6" component="span" color="success.main">
                {summary.respondedCount}
              </Typography>
            </Box>
            <Box textAlign="center">
              <SText fontSize={11} color="grey.600">
                Não responderam
              </SText>
              <Typography variant="h6" component="span" color="text.secondary">
                {summary.notRespondedCount}
              </Typography>
            </Box>
          </SFlex>
        </Box>
      )}
    </SPaper>
  );
};
