import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SText } from '@v2/components/atoms/SText/SText';
import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import type { IFormParticipantsAdherenceEvolutionModel } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';
import type { IFormParticipantsFilterSummary } from '@v2/models/form/models/form-participants/form-participants-browse.model';
import { Box, LinearProgress, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

const FormParticipantsAdherenceEvolutionChart = dynamic(
  () =>
    import('./FormParticipantsAdherenceEvolutionChart').then(
      (mod) => mod.FormParticipantsAdherenceEvolutionChart,
    ),
  { ssr: false },
);

type Props = {
  summary: IFormParticipantsFilterSummary;
  isLoading?: boolean;
  evolution?: IFormParticipantsAdherenceEvolutionModel;
  evolutionLoading?: boolean;
  evolutionError?: boolean;
};

export const FormParticipantsFilterSummary = ({
  summary,
  isLoading,
  evolution,
  evolutionLoading,
  evolutionError,
}: Props) => {
  const pct = summary.responseRatePercent;
  const barPct = Math.min(100, Math.max(0, pct));
  const barColor = getResponseRateBarColor(pct);
  const showEvolutionChart =
    !evolutionLoading &&
    !evolutionError &&
    !!evolution &&
    evolution.series.length > 0 &&
    evolution.totalParticipants > 0;

  return (
    <SPaper
      sx={{
        px: 2.5,
        pt: 2,
        pb: 2,
        mb: 2,
        borderRadius: 2,
        border: '2px solid',
        borderColor: 'grey.300',
        backgroundColor: 'grey.50',
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={600}
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        Resumo do recorte filtrado
      </Typography>
      {isLoading ? (
        <SText color="text.secondary">Carregando indicadores…</SText>
      ) : (
        <Box maxWidth={760} mx="auto">
          <Typography
            variant="body2"
            textAlign="center"
            color="warning.main"
            fontWeight={700}
            mb={0.75}
          >
            Taxa de resposta no recorte
          </Typography>
          <Box width="100%">
            <LinearProgress
              variant="determinate"
              value={barPct}
              sx={{
                height: 28,
                borderRadius: 14,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: barColor,
                  borderRadius: 14,
                },
              }}
            />
            <Typography
              textAlign="center"
              mt={1}
              sx={{
                color: barColor,
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.35rem' },
                lineHeight: 1.15,
              }}
            >
              {pct.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}
              %
            </Typography>
            <Typography
              variant="body2"
              textAlign="center"
              color="text.secondary"
              mt={0.5}
            >
              Total: {summary.totalParticipants} participantes | Responderam:{' '}
              {summary.respondedCount} | Não responderam:{' '}
              {summary.notRespondedCount}
            </Typography>
          </Box>
          <SFlex gap={3} flexWrap="wrap" justifyContent="center" mt={1.25}>
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

      <Box mt={isLoading ? 1.5 : 2.25}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.primary"
          textAlign="center"
          sx={{ mb: 0.5 }}
        >
          Evolução da adesão
        </Typography>
        {evolutionLoading ? (
          <SText color="text.secondary" textAlign="center">
            Carregando evolução…
          </SText>
        ) : evolutionError ? (
          <SText color="text.secondary" textAlign="center">
            Não foi possível carregar a evolução da adesão.
          </SText>
        ) : evolution && evolution.totalParticipants === 0 ? (
          <SText color="text.secondary" textAlign="center">
            Nenhum participante no recorte atual.
          </SText>
        ) : showEvolutionChart && evolution ? (
          <>
            <FormParticipantsAdherenceEvolutionChart evolution={evolution} />
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textAlign="center"
              mt={0.75}
            >
              Evolução calculada com base nos participantes atuais do recorte.
            </Typography>
          </>
        ) : (
          <SText color="text.secondary" textAlign="center">
            Sem dados de evolução para o período da campanha.
          </SText>
        )}
      </Box>
    </SPaper>
  );
};
