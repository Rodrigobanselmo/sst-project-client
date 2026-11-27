import { Box, Typography } from '@mui/material';
export const number = (n: number | null | undefined, suffix = '') =>
  n == null
    ? 'Não disponível'
    : n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + suffix;
export const riskLabels = [
  'Não informado',
  'Muito baixo',
  'Baixo',
  'Moderado',
  'Alto',
  'Muito alto',
  'Interromper',
];
export const riskColors = [
  '#64748b',
  '#34b87a',
  '#9cb32b',
  '#d0a900',
  '#df792b',
  '#e34d50',
  '#9d174d',
];
export function Bars({
  rows,
  percent = true,
}: {
  rows: {
    name: string;
    value: number | null;
    detail?: string;
    color?: string;
  }[];
  percent?: boolean;
}) {
  const max = percent ? 100 : Math.max(1, ...rows.map((r) => r.value ?? 0));
  return (
    <Box component="figure" sx={{ m: 0, my: '20px', minWidth: 0 }}>
      {rows.map((r, i) => (
        <Box key={i} sx={{ mb: '18px' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              mb: '6px',
              flexWrap: 'wrap',
            }}
          >
            <Typography color="text.primary" component="span">
              {r.name}
            </Typography>
            <Typography color="text.primary" component="span" fontWeight={700}>
              {r.value == null
                ? 'Dados protegidos / sem base válida'
                : number(r.value, percent ? '%' : '')}
              {r.detail ? ` · ${r.detail}` : ''}
            </Typography>
          </Box>
          <svg
            viewBox="0 0 1000 20"
            width="100%"
            height="20"
            preserveAspectRatio="none"
            role="img"
            aria-label={`${r.name}: ${number(r.value, percent ? '%' : '')}`}
            style={{ display: 'block', maxWidth: '100%' }}
          >
            <rect
              width="1000"
              height="20"
              rx="6"
              fill="#64748b"
              fillOpacity=".2"
            />
            {r.value != null && (
              <rect
                width={Math.max(0, Math.min(1000, (r.value / max) * 1000))}
                height="20"
                rx="6"
                fill={r.color ?? '#3b9ad9'}
              />
            )}
          </svg>
        </Box>
      ))}
    </Box>
  );
}
export function Radar({
  rows,
  title = 'Radar das escalas, pontuação de 0 a 100',
  numberedAxes = false,
  series,
  axisNumbers,
}: {
  rows: { name: string; score: number | null }[];
  title?: string;
  numberedAxes?: boolean;
  axisNumbers?: number[];
  series?: { name: string; rows: { name: string; score: number | null }[] }[];
}) {
  if (rows.length < 3) return null;
  const point = (i: number, value: number) => {
    const a = (i * 2 * Math.PI) / rows.length - Math.PI / 2;
    const radius = numberedAxes ? 2.3575 : 2.05;
    return [350 + Math.cos(a) * value * radius, 285 + Math.sin(a) * value * radius];
  };
  return (
    <Box
      component="figure"
      sx={{ m: 0, width: '100%', maxWidth: numberedAxes ? '1100px' : '780px', mx: 'auto' }}
      data-report-radar
    >
      <svg viewBox={numberedAxes ? "-200 -200 1100 970" : "0 0 700 570"} width="100%" role="img" aria-label={title}>
        {[25, 50, 75, 100].map((n) => (
          <polygon
            key={n}
            points={rows.map((_, i) => point(i, n).join(',')).join(' ')}
            fill="none"
            stroke="#94a3b8"
            strokeOpacity=".5"
          />
        ))}
        {rows.map((r, i) => {
          const [x, y] = point(i, 100),
            [lx, ly] = point(i, numberedAxes ? 108 : 128);
          const angle = (i * 360) / rows.length - 90;
          const flipped = Math.cos(angle * Math.PI / 180) < -0.001;
          return (
            <g key={r.name}>
              <line
                x1="350"
                y1="285"
                x2={x}
                y2={y}
                stroke="#94a3b8"
                strokeOpacity=".4"
              />
              <text
                x={lx}
                y={ly}
                textAnchor={numberedAxes ? (flipped ? 'end' : 'start') : 'middle'}
                transform={numberedAxes ? `rotate(${angle + (flipped ? 180 : 0)}, ${lx}, ${ly})` : undefined}
                dominantBaseline={numberedAxes ? 'middle' : undefined}
                fill="currentColor"
                fontSize={numberedAxes ? 14 : 12}
              >
                {(numberedAxes
                  ? `${axisNumbers?.[i] ?? i + 1}. ${r.name.replace(/^(Escala|Dimensão) — /, '')}`
                  : r.name.replace(/^(Escala|Dimensão) — /, '')
                )
                  .split(' ')
                  .reduce<string[][]>(
                    (lines, w) => {
                      const last = lines[lines.length - 1];
                      if (last.join(' ').length + w.length > 24)
                        lines.push([w]);
                      else last.push(w);
                      return lines;
                    },
                    [[]],
                  )
                  .map((line, j) => (
                    <tspan key={j} x={lx} dy={j ? '16' : '0'}>
                      {line.join(' ')}
                    </tspan>
                  ))}
              </text>
            </g>
          );
        })}
        {(series ?? [{ name: title, rows }]).map((item, seriesIndex) => {
          const color = ['#3b9ad9', '#ffb74d', '#ab87ff', '#26c6da', '#ef77a7', '#66bb6a'][seriesIndex % 6];
          const matched = rows.flatMap((axis, index) => {
            const value = item.rows.find((row) => row.name === axis.name);
            return value ? [{ index, score: value.score }] : [];
          });
          return <g key={item.name}>
            {matched.length >= 3 && matched.every((r) => r.score != null) && <polygon points={matched.map((r) => point(r.index, r.score!).join(',')).join(' ')} fill={color} fillOpacity=".2" stroke={color} strokeWidth="3" />}
            {matched.map((r) => r.score == null ? null : <circle key={r.index} cx={point(r.index, r.score)[0]} cy={point(r.index, r.score)[1]} r="5" fill={color} />)}
          </g>;
        })}
        {[0, 25, 50, 75, 100].map((value) => (
          <text
            key={`tick-${value}`}
            x={point(0, value)[0] + 8}
            y={point(0, value)[1] + 4}
            fill="currentColor"
            fontSize="14"
            fontWeight="700"
            aria-hidden="true"
          >
            {value}%
          </text>
        ))}
      </svg>
      {series && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', mb: 8 }}>{series.map((item, index) => <Typography key={item.name} color="text.primary"><Box component="span" sx={{ display: 'inline-block', width: 24, height: 6, mr: 3, bgcolor: ['#3b9ad9', '#ffb74d', '#ab87ff', '#26c6da', '#ef77a7', '#66bb6a'][index % 6] }} />{item.name.replace(/^Escala — /, '')}</Typography>)}</Box>}
      <Typography color="text.primary" component="figcaption" variant="caption">
        Pontuação normalizada do instrumento. As distâncias no radar não
        representam probabilidades de adoecimento.
      </Typography>
    </Box>
  );
}

export function AdherenceChart({
  series,
  total,
}: {
  series: { date: string; newResponses: number }[];
  total: number;
}) {
  if (!series.length)
    return (
      <Typography color="text.primary">
        Não há respostas datadas neste recorte.
      </Typography>
    );
  const start = Date.parse(series[0].date + 'T12:00:00Z'),
    end = Date.parse(series[series.length - 1].date + 'T12:00:00Z');
  const duration = Math.max(86400000, end - start),
    maximum = Math.max(1, ...series.map((p) => p.newResponses));
  const x = (date: string) =>
    70 + ((Date.parse(date + 'T12:00:00Z') - start) / duration) * 860;
  let cumulative = 0;
  const points = series.map((p) => {
    cumulative += p.newResponses;
    return {
      ...p,
      x: x(p.date),
      percent: total ? (cumulative / total) * 100 : 0,
    };
  });
  const barWidth = Math.max(
    2,
    Math.min(20, (860 / (duration / 86400000 + 1)) * 0.65),
  );
  return (
    <Box
      component="figure"
      sx={{ m: 0, my: '24px', width: '100%', minWidth: 0 }}
    >
      <svg
        viewBox="0 0 1000 350"
        width="100%"
        role="img"
        aria-label="Evolução diária de respostas e adesão acumulada"
      >
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}>
            <line
              x1="70"
              x2="930"
              y1={280 - t * 2.2}
              y2={280 - t * 2.2}
              stroke="#94a3b8"
              strokeOpacity=".3"
            />
            <text x="945" y={285 - t * 2.2} fill="currentColor" fontSize="12">
              {t}%
            </text>
            <text
              x="58"
              y={285 - t * 2.2}
              textAnchor="end"
              fill="currentColor"
              fontSize="12"
            >
              {Math.round((maximum * t) / 100)}
            </text>
          </g>
        ))}
        {points.map((p) => (
          <rect
            key={p.date}
            x={p.x - barWidth / 2}
            y={280 - (p.newResponses / maximum) * 220}
            width={barWidth}
            height={(p.newResponses / maximum) * 220}
            fill="#3b9ad9"
            fillOpacity=".65"
          >
            <title>
              {p.date}: {p.newResponses} novas respostas;{' '}
              {number(p.percent, '%')} de adesão
            </title>
          </rect>
        ))}
        <polyline
          points={points
            .map((p) => `${p.x},${280 - p.percent * 2.2}`)
            .join(' ')}
          fill="none"
          stroke="#d1a800"
          strokeWidth="3"
        />
        {points.length === 1 && (
          <circle
            cx={points[0].x}
            cy={280 - points[0].percent * 2.2}
            r="5"
            fill="#d1a800"
          />
        )}
        {[
          series[0],
          series[Math.floor((series.length - 1) / 2)],
          series[series.length - 1],
        ]
          .filter((p, i, a) => a.findIndex((v) => v.date === p.date) === i)
          .map((p) => (
            <text
              key={p.date}
              x={x(p.date)}
              y="305"
              textAnchor="middle"
              fill="currentColor"
              fontSize="12"
            >
              {p.date.split('-').reverse().join('/')}
            </text>
          ))}
        <text x="70" y="30" fill="currentColor" fontSize="14">
          Respostas por dia
        </text>
        <text x="930" y="30" textAnchor="end" fill="currentColor" fontSize="14">
          Adesão acumulada (%)
        </text>
        <rect x="270" y="328" width="16" height="10" fill="#3b9ad9" />
        <text x="295" y="338" fontSize="13" fill="currentColor">
          Novas respostas
        </text>
        <line
          x1="520"
          x2="545"
          y1="333"
          y2="333"
          stroke="#d1a800"
          strokeWidth="3"
        />
        <text x="555" y="338" fontSize="13" fill="currentColor">
          Adesão acumulada
        </text>
      </svg>
      <Typography color="text.primary" component="figcaption" variant="caption">
        Pessoas distintas com resposta por dia e percentual acumulado sobre o
        público elegível. Datas civis da campanha no fuso de São Paulo.
      </Typography>
    </Box>
  );
}
