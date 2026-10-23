import type { IPcmsoComparableConfig as Config } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import { buildLibraryParameterPatch } from './exam-risk-library-parameter.util';
import {
  buildInlineParameterPatch,
  inlineParameterCopyDraft,
  type InlineParameterGroup,
  type InlineRiskScope,
} from './exam-risk-inline-parameter.util';
import type { IExamToRisk } from 'core/interfaces/api/IExam';

// Validate the entire planned change before the first request, using the existing serializers.
export async function buildSynchronizationPlan(
  groups: InlineParameterGroup[],
  source: Config,
  target: Config | IExamToRisk,
  scope?: InlineRiskScope,
  link?: IExamToRisk,
) {
  const plans: Array<{
    group: InlineParameterGroup;
    patch: Record<string, any>;
  }> = [];
  let merged = { ...target } as Config;
  // Events can depend on periodicity; validate them against the resulting interval.
  const ordered = [...groups].sort(
    (a, b) =>
      Number(b === 'validityInMonths') - Number(a === 'validityInMonths'),
  );
  if (groups.includes('events')) merged.isPeriodic = source.isPeriodic;
  if (groups.includes('validityInMonths'))
    merged.validityInMonths = source.validityInMonths;
  for (const group of ordered) {
    const draft = inlineParameterCopyDraft(
      group,
      source,
      merged,
      Boolean(link),
    );
    const patch =
      link && scope
        ? await buildInlineParameterPatch(
            scope,
            { ...link, ...merged } as IExamToRisk,
            { linkId: link.id, examId: link.examId },
            group,
            draft,
          )
        : buildLibraryParameterPatch(group, draft, merged);
    plans.push({ group, patch });
    merged = { ...merged, ...patch };
  }
  return plans;
}

// Stops on the first failure; callers must report completed writes, never total success.
export async function runSynchronization<T>(
  steps: T[],
  save: (step: T) => Promise<void>,
) {
  let completed = 0;
  try {
    for (const step of steps) {
      await save(step);
      completed++;
    }
    return { completed };
  } catch (error) {
    return { completed, error };
  }
}
