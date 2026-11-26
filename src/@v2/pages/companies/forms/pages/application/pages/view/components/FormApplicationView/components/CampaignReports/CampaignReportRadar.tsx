import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from 'core/services/apiClient';

type Point = { id: string; score: number | null };
type Series = {
  id: string;
  label: string;
  participants?: number;
  points: Point[];
};
type RadarData = {
  version: string;
  createdAt: string;
  axes: { id: string; name: string }[];
  dimensions: {
    id: string;
    label: string;
    protectedGroups: boolean;
    series: Series[];
  }[];
};
const colors = [
  '#3689df',
  '#df8b35',
  '#2b9e8d',
  '#ab78db',
  '#d84c86',
  '#888c20',
];
const plain = (s: string) =>
  s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .trim();
const pct = (n: number) =>
  `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
function lines(text: string) {
  const words = plain(text).split(/\s+/);
  const result: string[] = [];
  for (const word of words) {
    if (result.length && result[result.length - 1].length + word.length < 23)
      result[result.length - 1] += ' ' + word;
    else result.push(word);
  }
  return result;
}
export function CampaignReportRadar({
  companyId,
  applicationId,
  reportId,
  groups,
  dark,
  participants,
}: {
  companyId: string;
  applicationId: string;
  reportId?: string;
  groups: { id: string; name: string; score: number | null }[];
  dark: boolean;
  participants?: number;
}) {
  const query = useQuery<RadarData>({
    queryKey: ['campaign-report-radar', companyId, applicationId, reportId],
    enabled: !!reportId,
    queryFn: async () =>
      (
        await api.post(
          `/v2/companies/${encodeURIComponent(companyId)}/forms/applications/${encodeURIComponent(applicationId)}/reports/${encodeURIComponent(reportId!)}/radar`,
        )
      ).data,
    staleTime: Infinity,
    retry: false,
  });
  const [dimensionId, setDimensionId] = useState('');
  const [selection, setSelection] = useState<Record<string, string[]>>({});
  const dimension = query.data?.dimensions.find((d) => d.id === dimensionId);
  const overall: Series = {
    id: 'overall',
    label: 'Todos os participantes',
    participants,
    points: groups.map((g) => ({ id: g.id, score: g.score })),
  };
  const options = dimension ? dimension.series : [overall];
  const selected = selection[dimensionId] ?? options.map((s) => s.id);
  const visible = options.filter((s) => selected.includes(s.id));
  const axes = groups.filter((g) => g.score !== null);
  if (axes.length < 3) return null;
  const cx = 500,
    cy = 365,
    r = 210;
  const xy = (index: number, value: number, extra = 0) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / axes.length;
    return [
      cx + Math.cos(angle) * ((r * value) / 100 + extra),
      cy + Math.sin(angle) * ((r * value) / 100 + extra),
    ];
  };
  const polygon = (values: number[]) =>
    values.map((value, i) => xy(i, value).join(',')).join(' ');
  const text = dark ? '#e1e7ef' : '#17212f',
    grid = dark ? '#536174' : '#c2ccd9';
  return (
    <Box
      component="figure"
      data-report-radar
      sx={{ my: '32px', breakInside: 'avoid' }}
    >
      <h3>Visão geral por tema — radar comparativo</h3>
      <p>
        Cada eixo representa um tema. Quanto mais próximo de 100%, mais
        favorável é o indicador. A escala e os cálculos são os mesmos das barras
        abaixo.
      </p>
      <Box
        data-radar-controls
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          '@media print': { display: 'none' },
        }}
      >
        <Box component="label">
          Agrupar radar por{' '}
          <Box
            component="select"
            aria-label="Agrupar radar por"
            value={dimensionId}
            onChange={(e) => setDimensionId(e.target.value)}
            sx={{
              p: '12px',
              minHeight: '44px',
              maxWidth: '100%',
              color: 'inherit',
              backgroundColor: dark ? '#263244' : '#fff',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
            }}
          >
            <option value="">Todos os participantes</option>
            {query.data?.dimensions.map((d) => (
              <option key={d.id} value={d.id}>
                {plain(d.label)}
              </option>
            ))}
          </Box>
        </Box>
        {options.map((s, index) => (
          <FormControlLabel
            sx={{
              color: dark ? '#e1e7ef' : '#17212f',
              '& .MuiFormControlLabel-label': {
                color: 'inherit',
                fontSize: '18px',
              },
            }}
            key={s.id}
            label={plain(s.label)}
            control={
              <Checkbox
                checked={selected.includes(s.id)}
                onChange={(_, checked) =>
                  setSelection({
                    ...selection,
                    [dimensionId]: checked
                      ? [...selected, s.id]
                      : selected.filter((id) => id !== s.id),
                  })
                }
                sx={{
                  color: colors[index % colors.length],
                  '&.Mui-checked': { color: colors[index % colors.length] },
                }}
              />
            }
          />
        ))}
      </Box>
      {query.isPending && !!reportId && (
        <Typography variant="body2">
          Preparando comparações desta versão…
        </Typography>
      )}
      {query.isError && (
        <Alert severity="info">
          As comparações desta versão não estão disponíveis. O radar geral usa
          os indicadores preservados do relatório.
        </Alert>
      )}
      {dimension?.protectedGroups && (
        <p>
          <small>
            Alguns grupos foram protegidos por contagens pequenas ou proteção
            complementar. Seus valores não são exibidos.
          </small>
        </p>
      )}
      <p>
        <strong>Recorte do radar:</strong>{' '}
        {dimension ? plain(dimension.label) : 'Todos os participantes'} ·{' '}
        {visible.map((s) => plain(s.label)).join(' / ') ||
          'Nenhum grupo selecionado'}
      </p>
      <svg
        viewBox="0 0 1000 760"
        role="img"
        aria-label={`Radar comparativo por tema: ${visible.map((s) => plain(s.label)).join(', ')}`}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '1300px',
          margin: '0 auto',
          color: text,
          printColorAdjust: 'exact',
        }}
      >
        {[25, 50, 75, 100].map((value) => (
          <g key={value}>
            <polygon
              points={polygon(axes.map(() => value))}
              fill="none"
              stroke={grid}
              strokeWidth="1"
            />
            <text
              x={cx + 8}
              y={cy - (r * value) / 100 - 5}
              fill={text}
              fontSize="15"
            >
              {value}
            </text>
          </g>
        ))}
        {axes.map((axis, i) => {
          const [x, y] = xy(i, 100);
          const [lx, ly] = xy(i, 100, 55);
          const parts = lines(axis.name);
          return (
            <g key={axis.id}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={grid} />
              <text
                x={lx}
                y={ly - (parts.length - 1) * 10}
                textAnchor={
                  Math.abs(lx - cx) < 20 ? 'middle' : lx > cx ? 'start' : 'end'
                }
                fill={text}
                fontSize="18"
                fontWeight="600"
              >
                {parts.map((line, j) => (
                  <tspan key={j} x={lx} dy={j ? 24 : 0}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
        {visible.map((s) => {
          const color = colors[options.indexOf(s) % colors.length];
          const values = axes.map(
            (a) => s.points.find((p) => p.id === a.id)?.score ?? null,
          );
          return (
            <g key={s.id}>
              {values.every((v) => v !== null) && (
                <polygon
                  points={polygon(values as number[])}
                  fill={color}
                  fillOpacity="0.09"
                  stroke={color}
                  strokeWidth="3"
                />
              )}
              {values.map((v, i) => {
                if (v === null) return null;
                const [x, y] = xy(i, v);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={color}
                    stroke={dark ? '#e1e7ef' : '#fff'}
                    strokeWidth="2"
                    tabIndex={0}
                  >
                    <title>
                      {plain(s.label)} · {plain(axes[i].name)}: {pct(v)}
                    </title>
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {visible.map((s) => (
          <span key={s.id}>
            <span style={{ color: colors[options.indexOf(s) % colors.length] }}>
              ●
            </span>{' '}
            {plain(s.label)}
            {s.participants !== undefined
              ? ` — ${s.participants} participantes`
              : ''}
          </span>
        ))}
      </Box>
      <table>
        <thead>
          <tr>
            <th>Tema</th>
            {visible.map((s) => (
              <th key={s.id}>{plain(s.label)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {axes.map((axis) => (
            <tr key={axis.id}>
              <td>{plain(axis.name)}</td>
              {visible.map((s) => {
                const score = s.points.find((p) => p.id === axis.id)?.score;
                return (
                  <td key={s.id}>
                    {score == null
                      ? 'Base protegida ou sem indicador'
                      : pct(score)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {dimension && query.data && (
        <p>
          <small>
            Comparações agregadas preservadas em{' '}
            {new Date(query.data.createdAt).toLocaleDateString('pt-BR', {
              timeZone: 'America/Bahia',
            })}
            . A seleção deste radar não altera a análise por IA nem as barras
            gerais. O PDF registra o recorte exibido.
          </small>
        </p>
      )}
    </Box>
  );
}
