/**
 * npx tsx src/@v2/models/form/helpers/form-participants-adherence-evolution-reminder-markers.spec.ts
 */
import assert from 'node:assert/strict';

import {
  buildAdherenceEvolutionPdfSection,
  shouldStaggerPdfAdherenceMarkerLabels,
} from './form-participants-adherence-evolution-pdf-svg';
import {
  emailInitialLabel,
  emailReminderLabel,
  groupAdherenceEmailMarkersOnSeries,
} from './form-participants-adherence-evolution-reminder-markers';
import type { IFormParticipantsAdherenceEvolutionModel } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';
import { ADHERENCE_EVOLUTION_TIMEZONE } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';

assert.equal(emailInitialLabel(), 'E-mail inicial');
assert.equal(emailInitialLabel('default'), 'E-mail inicial');
assert.equal(emailInitialLabel('compact'), 'Envio inicial');

assert.equal(emailReminderLabel(1), 'E-mail — Reforço 1');
assert.equal(emailReminderLabel(2, 'default'), 'E-mail — Reforço 2');
assert.equal(emailReminderLabel(1, 'compact'), 'Reforço 1');
assert.equal(emailReminderLabel(5, 'compact'), 'Reforço 5');

const seriesDates = [
  '2026-03-10',
  '2026-03-11',
  '2026-03-12',
  '2026-03-20',
];

const screenGroups = groupAdherenceEmailMarkersOnSeries(
  seriesDates,
  [
    { sentAt: '2026-03-11T15:00:00.000Z', round: 1 },
    { sentAt: '2026-03-12T15:00:00.000Z', round: 2 },
  ],
  { sentAt: '2026-03-10T15:00:00.000Z' },
);
assert.deepEqual(
  screenGroups.map((group) => group.labels),
  [['E-mail inicial'], ['E-mail — Reforço 1'], ['E-mail — Reforço 2']],
);

const pdfGroups = groupAdherenceEmailMarkersOnSeries(
  seriesDates,
  [
    { sentAt: '2026-03-11T15:00:00.000Z', round: 1 },
    { sentAt: '2026-03-12T15:00:00.000Z', round: 2 },
  ],
  { sentAt: '2026-03-10T15:00:00.000Z' },
  'compact',
);
assert.deepEqual(
  pdfGroups.map((group) => group.labels),
  [['Envio inicial'], ['Reforço 1'], ['Reforço 2']],
);

assert.equal(
  shouldStaggerPdfAdherenceMarkerLabels(pdfGroups, [100, 400, 700]),
  false,
);
assert.equal(
  shouldStaggerPdfAdherenceMarkerLabels(pdfGroups, [100, 130, 160]),
  true,
);
assert.equal(
  shouldStaggerPdfAdherenceMarkerLabels(pdfGroups.slice(0, 1), [100]),
  false,
);

const closeSeries = Array.from({ length: 20 }, (_, index) => {
  const day = String(index + 1).padStart(2, '0');
  return {
    date: `2026-03-${day}`,
    newResponses: index === 0 ? 2 : 1,
    cumulativeResponses: index + 2,
    cumulativePercent: Math.min(100, (index + 2) * 4),
  };
});

const closeEvolution: IFormParticipantsAdherenceEvolutionModel = {
  startedAt: '2026-03-01T12:00:00.000Z',
  endedAt: null,
  asOf: '2026-03-20T12:00:00.000Z',
  timezone: ADHERENCE_EVOLUTION_TIMEZONE,
  totalParticipants: 40,
  respondedCount: 21,
  participationGoal: 80,
  series: closeSeries,
  reminders: [
    { sentAt: '2026-03-03T15:00:00.000Z', round: 1 },
    { sentAt: '2026-03-04T15:00:00.000Z', round: 2 },
    { sentAt: '2026-03-05T15:00:00.000Z', round: 3 },
  ],
  initialEmail: { sentAt: '2026-03-01T15:00:00.000Z' },
};

const closeSvg = buildAdherenceEvolutionPdfSection(closeEvolution);
assert.match(closeSvg, />Envio inicial</);
assert.match(closeSvg, />Reforço 1</);
assert.match(closeSvg, />Reforço 2</);
assert.match(closeSvg, />Reforço 3</);
assert.equal(closeSvg.includes('E-mail —'), false);
assert.equal(closeSvg.includes('E-mail inicial'), false);
assert.equal(closeSvg.includes('@'), false);

const closeLabelYs = [...closeSvg.matchAll(/<text x="[\d.]+" y="([\d.]+)" text-anchor="middle" font-size="9"/g)].map(
  (match) => Number(match[1]),
);
assert.equal(closeLabelYs.length, 4);
assert.equal(new Set(closeLabelYs).size, 2);

const closeMarkerLines = [
  ...closeSvg.matchAll(
    /<line x1="([\d.]+)" y1="16" x2="([\d.]+)" y2="[\d.]+" stroke="#5d4037"/g,
  ),
];
assert.equal(closeMarkerLines.length, 4);
for (const match of closeMarkerLines) {
  assert.equal(match[1], match[2]);
}

const closeTexts = [
  ...closeSvg.matchAll(
    /<text x="([\d.]+)" y="[\d.]+" text-anchor="middle" font-size="9"[^>]*>([^<]+)</g,
  ),
];
assert.equal(closeTexts.length, 4);
closeTexts.forEach((text, index) => {
  assert.equal(text[1], closeMarkerLines[index]?.[1]);
});

const farEvolution: IFormParticipantsAdherenceEvolutionModel = {
  ...closeEvolution,
  series: [
    {
      date: '2026-03-01',
      newResponses: 2,
      cumulativeResponses: 2,
      cumulativePercent: 5,
    },
    {
      date: '2026-03-15',
      newResponses: 1,
      cumulativeResponses: 3,
      cumulativePercent: 7.5,
    },
  ],
  reminders: [{ sentAt: '2026-03-15T15:00:00.000Z', round: 1 }],
  initialEmail: { sentAt: '2026-03-01T15:00:00.000Z' },
};

const farSvg = buildAdherenceEvolutionPdfSection(farEvolution);
const farLabelYs = [...farSvg.matchAll(/<text x="[\d.]+" y="([\d.]+)" text-anchor="middle" font-size="9"/g)].map(
  (match) => Number(match[1]),
);
assert.equal(farLabelYs.length, 2);
assert.equal(new Set(farLabelYs).size, 1);
assert.match(farSvg, />Envio inicial</);
assert.match(farSvg, />Reforço 1</);

console.log('form-participants-adherence-evolution-reminder-markers.spec.ts ok');
