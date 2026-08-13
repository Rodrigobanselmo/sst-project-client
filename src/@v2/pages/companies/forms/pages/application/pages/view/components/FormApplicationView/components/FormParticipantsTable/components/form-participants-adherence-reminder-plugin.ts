import type { Plugin } from 'chart.js';
import {
  groupAdherenceRemindersOnSeries,
  reminderLabel,
  type AdherenceReminderMarkerGroup,
} from '@v2/models/form/helpers/form-participants-adherence-evolution-reminder-markers';
import type { IFormParticipantsAdherenceEvolutionReminder } from '@v2/models/form/models/form-participants/form-participants-adherence-evolution.model';

const LINE_COLOR = 'rgba(93, 64, 55, 0.55)';
const LABEL_COLOR = '#5d4037';
const LABEL_LINE_HEIGHT = 12;

function createPlugin(
  groups: AdherenceReminderMarkerGroup[],
): Plugin<'bar' | 'line'> {
  return {
    id: 'formParticipantsAdherenceReminderMarkers',
    afterDraw(chart) {
      if (!groups.length) return;
      const xScale = chart.scales.x;
      const area = chart.chartArea;
      if (!xScale || !area) return;

      const ctx = chart.ctx;
      ctx.save();
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.fillStyle = LABEL_COLOR;
      ctx.font = '10px sans-serif';
      ctx.textBaseline = 'top';

      for (const group of groups) {
        const x = xScale.getPixelForValue(group.index);
        if (!Number.isFinite(x) || x < area.left - 2 || x > area.right + 2) {
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(x, area.top);
        ctx.lineTo(x, area.bottom);
        ctx.stroke();

        const nearLeft = x - area.left < 36;
        const nearRight = area.right - x < 36;
        ctx.textAlign = nearLeft ? 'left' : nearRight ? 'right' : 'center';
        const textX = nearLeft ? x + 3 : nearRight ? x - 3 : x;

        group.rounds.forEach((round, offset) => {
          ctx.fillText(
            reminderLabel(round),
            textX,
            area.top + 2 + offset * LABEL_LINE_HEIGHT,
          );
        });
      }

      ctx.restore();
    },
  };
}

export function createAdherenceReminderMarkersPlugin(
  seriesDates: string[],
  reminders: IFormParticipantsAdherenceEvolutionReminder[] | undefined,
): Plugin<'bar' | 'line'> {
  return createPlugin(groupAdherenceRemindersOnSeries(seriesDates, reminders));
}
