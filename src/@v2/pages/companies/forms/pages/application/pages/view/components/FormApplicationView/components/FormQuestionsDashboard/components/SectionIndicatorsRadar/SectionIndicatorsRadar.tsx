import {
  alpha,
  Box,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { buildIndicatorRadarChart } from '../../helpers/formIndicatorRadar';
import {
  calculateFormIndicatorFromQuestions,
  type QuestionAnswersForIndicator,
} from '../../helpers/calculate-form-indicator.util';

type Group = {
  groupId: string;
  groupName: string;
  participantCount: number;
  questions: Array<
    QuestionAnswersForIndicator & { groupId: string; groupName: string }
  >;
};
export function SectionIndicatorsRadar({
  groups,
  isShareableLink,
}: {
  groups: Group[];
  isShareableLink: boolean;
}) {
  const theme = useTheme();
  const points = [
    ...new Map(
      groups
        .flatMap((g) => g.questions)
        .map((q) => [q.groupId, { id: q.groupId, name: q.groupName }]),
    ).values(),
  ];
  const series = groups.map((g, index) => {
    const color = [
      '#3689DF',
      '#D16B18',
      '#2B9E8D',
      '#A46BDC',
      '#D84C86',
      '#888C20',
      '#6187A1',
      '#B05D53',
    ][index % 8];
    const protectedSeries = !isShareableLink && g.participantCount < 3;
    const sectionIds = [
      ...new Set([
        ...points.map((p) => p.id),
        ...g.questions.map((q) => q.groupId),
      ]),
    ];
    const data = sectionIds.map((id) => {
      const questions = g.questions.filter((q) => q.groupId === id);
      return {
        id,
        name:
          points.find((p) => p.id === id)?.name ??
          questions[0]?.groupName ??
          id,
        ...(protectedSeries
          ? { score: 0, percentage: 0, hasValidAnswers: false }
          : calculateFormIndicatorFromQuestions(questions)),
      };
    });
    return { group: g, color, protectedSeries, points: data };
  });
  const axes = [
    ...new Map(series.flatMap((s) => s.points).map((p) => [p.id, p])).values(),
  ];
  const comparisonChart = buildIndicatorRadarChart(axes, {
    color: theme.palette.primary.main,
    textColor: theme.palette.text.primary,
    gridColor: alpha(theme.palette.text.primary, 0.24),
    paperColor: theme.palette.background.paper,
  });
  comparisonChart.data.datasets = series.map((s) => ({
    ...buildIndicatorRadarChart(
      axes.map(
        (axis) =>
          s.points.find((p) => p.id === axis.id) ?? {
            ...axis,
            hasValidAnswers: false,
          },
      ),
      {
        color: s.color,
        textColor: theme.palette.text.primary,
        gridColor: theme.palette.divider,
        paperColor: theme.palette.background.paper,
      },
    ).data.datasets[0],
    label: s.group.groupName,
    pointBackgroundColor: s.color,
  }));
  return (
    <SPaper sx={{ p: { xs: 6, sm: 10 }, borderRadius: 3 }}>
      <Typography color="text.primary" variant="h5" fontWeight={700}>
        Visão geral por seção
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 6 }}>
        Cada eixo representa uma seção do formulário. Quanto mais perto de 100%,
        mais favorável é o indicador. O gráfico respeita o recorte selecionado.
      </Typography>
      {groups.length === 0 && (
        <Typography color="text.secondary">
          Nenhum grupo selecionado para este recorte.
        </Typography>
      )}
      <Typography color="text.secondary" sx={{ mb: 6 }}>
        Os grupos selecionados no painel de agrupamento são apresentados como
        séries separadas. Os filtros de identificação definem o recorte de cada
        série.
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {series.map((s) => (
          <Typography key={s.group.groupId} color="text.primary">
            <Box component="span" sx={{ color: s.color }}>
              ●{' '}
            </Box>
            {s.group.groupName}
            {s.protectedSeries
              ? ' — Dados protegidos'
              : ` — ${s.group.participantCount} participantes`}
          </Typography>
        ))}
      </Box>
      {axes.length >= 3 &&
        series.some(
          (s) => s.points.filter((p) => p.hasValidAnswers).length >= 3,
        ) && (
          <Box sx={{ height: { xs: 400, sm: 520 } }}>
            <Radar
              data={comparisonChart.data}
              options={comparisonChart.options}
            />
          </Box>
        )}
      {axes.map((axis) => (
        <Box key={axis.id} sx={{ mt: 20, mb: 8 }}>
          <Typography
            color="text.primary"
            fontWeight={700}
            sx={{
              fontSize: { xs: '1rem', sm: '1.15rem' },
              lineHeight: 1.5,
              mb: 6,
            }}
          >
            {axis.name}
          </Typography>
          {series.map((s) => {
            const point = s.points.find((p) => p.id === axis.id);
            return (
              <Box key={s.group.groupId} sx={{ my: 4 }}>
                <Typography color="text.secondary">
                  {s.group.groupName}:{' '}
                  {s.protectedSeries
                    ? 'Dados protegidos'
                    : point?.hasValidAnswers
                      ? `${point.percentage}%`
                      : 'Sem dados'}
                </Typography>
                {point?.hasValidAnswers && (
                  <LinearProgress
                    variant="determinate"
                    value={point.percentage}
                    sx={{
                      height: 10,
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': { bgcolor: s.color },
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </SPaper>
  );
}
