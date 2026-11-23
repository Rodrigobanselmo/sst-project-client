import { Alert, Button, Stack, Typography } from '@mui/material';
export type SamplingDaysEstimate = {
  days: number | null;
  partial: boolean;
  dimensionedEvaluations: number;
  pendingEvaluations: number;
  sets: number;
  preparationMinutes: number;
  splitSets: number;
  issues: string[];
  assumptions: string[];
  scenarios: { key: string; label: string; days: number | null }[];
  combinedScenario: { days: number | null; pendingEvaluations: number };
};
export function SamplingDaysPanel({
  value: v,
  busy,
  error,
  onAdopt,
}: {
  value: SamplingDaysEstimate | null;
  busy: boolean;
  error: string;
  onAdopt: (days: number) => void;
}) {
  return (
    <Stack spacing={6} sx={{ pb: 8 }}>
      <Typography fontWeight={700}>
        Dias de coleta calculados pelo sistema
      </Typography>
      {busy ? (
        <Typography>Calculando recursos e cenários…</Typography>
      ) : error ? (
        <Alert severity="warning">{error}</Alert>
      ) : !v ? (
        <Typography variant="body2">
          Informe modalidade, profissionais, bombas, calibradores, jornada e
          quantidade de avaliações para calcular.
        </Typography>
      ) : (
        <>
          <Typography fontWeight={700}>
            {v.days == null
              ? 'Prazo ainda não dimensionado'
              : `${v.days} dia(s) estimado(s)${v.partial ? (v.pendingEvaluations ? ' — cálculo parcial; há avaliações pendentes' : ' — conforme as premissas abaixo') : ''}`}
          </Typography>
          <Typography variant="body2">
            {v.dimensionedEvaluations} avaliações dimensionadas · {v.sets}{' '}
            conjuntos de bomba · {v.splitSets} conjuntos com divisor ·{' '}
            {v.preparationMinutes} min de preparação somados. Tempos de
            preparação: 10 min (1 amostrador), 13 min (2), 15 min (3 ou 4).
          </Typography>
          {v.issues.map((issue) => (
            <Alert
              key={issue}
              severity={v.pendingEvaluations ? 'warning' : 'info'}
            >
              {issue}
            </Alert>
          ))}
          <Typography fontWeight={600}>
            Efeito dos recursos adicionais
          </Typography>
          {v.scenarios.map((s) => (
            <Typography key={s.key} variant="body2">
              {s.label}:{' '}
              {s.days == null
                ? 'prazo ainda não dimensionado'
                : `${s.days} dia(s)`}
              {s.days != null && v.days != null
                ? s.days < v.days
                  ? ` — reduz ${v.days - s.days} dia(s); este recurso limita o cenário atual`
                  : ' — sem redução de dias neste cenário'
                : ''}
              .
            </Typography>
          ))}
          {v.combinedScenario.days != null &&
            v.days != null &&
            v.combinedScenario.days < v.days && (
              <Alert severity="info">
                Confirmando as combinações de agentes sugeridas na 3.4:{' '}
                {v.combinedScenario.days} dia(s) para as coletas dimensionadas.
                A seleção atual não foi alterada.
              </Alert>
            )}
          {v.days != null && v.days > 0 && (
            <Button variant="outlined" onClick={() => onAdopt(v.days!)}>
              Usar {v.days} dia(s) no planejamento
            </Button>
          )}
          <details>
            <summary>Premissas e limites da estimativa</summary>
            {v.assumptions.map((a) => (
              <Typography variant="body2" key={a} sx={{ mt: 4 }}>
                {a}
              </Typography>
            ))}
          </details>
        </>
      )}
    </Stack>
  );
}
