import { getResponseRateBarColor } from '@v2/models/form/helpers/form-participants-response-rate-colors';
import {
  groupAdherenceEmailMarkersOnSeries,
} from '@v2/models/form/helpers/form-participants-adherence-evolution-reminder-markers';
import type { IFormParticipantsAdherenceEvolutionModel } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatCalendarTick(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  if (!month || !day) return isoDate;
  return `${day}/${month}`;
}

function formatPercent(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

function pickTickIndexes(length: number, maxTicks: number): number[] {
  if (length <= 0) return [];
  if (length <= maxTicks) {
    return Array.from({ length }, (_, i) => i);
  }
  const last = length - 1;
  const step = last / (maxTicks - 1);
  const indexes: number[] = [];
  for (let i = 0; i < maxTicks; i += 1) {
    indexes.push(Math.round(i * step));
  }
  return Array.from(new Set(indexes));
}

/**
 * SVG estático da evolução para o RECORTE (HTML + window.print).
 * Sem fetch e sem Chart.js. Retorna string vazia se não houver dados.
 */
export function buildAdherenceEvolutionPdfSection(
  evolution?: IFormParticipantsAdherenceEvolutionModel | null,
): string {
  if (!evolution?.series?.length || evolution.totalParticipants <= 0) {
    return '';
  }

  const series = evolution.series;
  const last = series[series.length - 1];
  const lineColor = getResponseRateBarColor(last.cumulativePercent);
  const goal =
    evolution.participationGoal != null && evolution.participationGoal > 0
      ? evolution.participationGoal
      : null;

  const width = 960;
  const height = 300;
  const padL = 52;
  const padR = 52;
  const padT = 16;
  const padB = 54;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const n = series.length;
  const slot = plotW / n;
  const barW = Math.max(1.5, Math.min(18, slot * 0.62));
  const maxCount = Math.max(1, ...series.map((p) => p.newResponses));

  const xAt = (index: number) => padL + slot * index + slot / 2;
  const yCount = (value: number) => padT + plotH * (1 - value / maxCount);
  const yPercent = (value: number) => padT + plotH * (1 - value / 100);

  const bars = series
    .map((point, index) => {
      const h = Math.max(0, yCount(0) - yCount(point.newResponses));
      if (h <= 0) return '';
      const x = xAt(index) - barW / 2;
      return `<rect x="${x.toFixed(2)}" y="${yCount(point.newResponses).toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" fill="rgba(25,118,210,0.42)" stroke="rgba(25,118,210,0.85)" stroke-width="0.6" rx="1.5"/>`;
    })
    .join('');

  const linePoints = series
    .map((point, index) => `${xAt(index).toFixed(2)},${yPercent(point.cumulativePercent).toFixed(2)}`)
    .join(' ');

  const dots =
    n <= 2
      ? series
          .map((point, index) => {
            return `<circle cx="${xAt(index).toFixed(2)}" cy="${yPercent(point.cumulativePercent).toFixed(2)}" r="3" fill="${escapeXml(lineColor)}" />`;
          })
          .join('')
      : '';

  const goalLine =
    goal == null
      ? ''
      : `<line x1="${padL}" y1="${yPercent(goal).toFixed(2)}" x2="${padL + plotW}" y2="${yPercent(goal).toFixed(2)}" stroke="#546e7a" stroke-width="1.4" stroke-dasharray="6 4"/>`;

  const reminderMarks = groupAdherenceEmailMarkersOnSeries(
    series.map((point) => point.date),
    evolution.reminders,
    evolution.initialEmail,
  )
    .map((group) => {
      const x = xAt(group.index).toFixed(2);
      const line = `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + plotH}" stroke="#5d4037" stroke-width="1" stroke-dasharray="4 3" stroke-opacity="0.7"/>`;
      const labels = group.labels
        .map((label, offset) => {
          const y = padT + 10 + offset * 12;
          return `<text x="${x}" y="${y.toFixed(2)}" text-anchor="middle" font-size="9" fill="#5d4037">${escapeXml(label)}</text>`;
        })
        .join('');
      return `${line}${labels}`;
    })
    .join('');

  const xTicks = pickTickIndexes(n, n > 60 ? 8 : n > 21 ? 10 : 12)
    .map((index) => {
      const x = xAt(index);
      const label = formatCalendarTick(series[index].date);
      return `<text x="${x.toFixed(2)}" y="${(padT + plotH + 16).toFixed(2)}" text-anchor="middle" font-size="10" fill="#555">${escapeXml(label)}</text>`;
    })
    .join('');

  const yCountTicks = [0, Math.round(maxCount / 2), maxCount]
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .map((value) => {
      const y = yCount(value);
      return `<text x="${padL - 8}" y="${(y + 3).toFixed(2)}" text-anchor="end" font-size="10" fill="#555">${value}</text>`;
    })
    .join('');

  const yPercentTicks = [0, 50, 100]
    .map((value) => {
      const y = yPercent(value);
      return `<text x="${padL + plotW + 8}" y="${(y + 3).toFixed(2)}" text-anchor="start" font-size="10" fill="#555">${value}%</text>`;
    })
    .join('');

  const legendY = height - 16;
  const legend = [
    `<rect x="${padL}" y="${legendY - 8}" width="12" height="8" fill="rgba(25,118,210,0.42)" stroke="rgba(25,118,210,0.85)"/>`,
    `<text x="${padL + 16}" y="${legendY}" font-size="11" fill="#333">Novas respostas</text>`,
    `<line x1="250" y1="${legendY - 4}" x2="274" y2="${legendY - 4}" stroke="${escapeXml(lineColor)}" stroke-width="2.2"/>`,
    `<text x="280" y="${legendY}" font-size="11" fill="#333">Adesão acumulada</text>`,
    goal == null
      ? ''
      : `<line x1="490" y1="${legendY - 4}" x2="514" y2="${legendY - 4}" stroke="#546e7a" stroke-width="1.5" stroke-dasharray="6 4"/><text x="520" y="${legendY}" font-size="11" fill="#333">Meta (${escapeXml(formatPercent(goal))}%)</text>`,
  ].join('');

  const lastPct = formatPercent(last.cumulativePercent);
  const lastCount = last.cumulativeResponses;

  return `<div class="evolution-block">
    <p class="section-title">Evolução da adesão</p>
    <svg class="evolution-svg" viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Evolução da adesão">
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#ccc"/>
      <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#ccc"/>
      ${yCountTicks}
      ${yPercentTicks}
      ${bars}
      ${goalLine}
      <polyline fill="none" stroke="${escapeXml(lineColor)}" stroke-width="2.2" points="${linePoints}"/>
      ${dots}
      ${reminderMarks}
      ${xTicks}
      ${legend}
    </svg>
    <p class="evolution-summary">Adesão acumulada: ${escapeXml(lastPct)}% (${lastCount} respostas)</p>
    <p class="evolution-note">Evolução calculada com base nos participantes atuais do recorte.</p>
  </div>`;
}
