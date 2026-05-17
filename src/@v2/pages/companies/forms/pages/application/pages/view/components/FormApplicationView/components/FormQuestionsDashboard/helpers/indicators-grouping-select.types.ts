import type { StructuralIndicatorGroupingKey } from '@v2/models/form/helpers/form-indicators-structural-grouping.config';
import { FormQuestionWithAnswersBrowseModel } from '@v2/models/form/models/form-questions-answers/form-question-with-answers-browse.model';

export const INDICATORS_GROUPING_SECTION_IDENTIFICATION_ID =
  '__section_identification';
export const INDICATORS_GROUPING_SECTION_STRUCTURAL_ID =
  '__section_structural';

export type IndicatorsGroupingSelectOption =
  | {
      kind: 'section';
      id: string;
      label: string;
      withTopSpacing?: boolean;
    }
  | {
      kind: 'question';
      id: string;
      label: string;
      question: FormQuestionWithAnswersBrowseModel;
    }
  | {
      kind: 'structural';
      id: StructuralIndicatorGroupingKey;
      label: string;
    };

export function isIndicatorsGroupingSelectableOption(
  option: IndicatorsGroupingSelectOption,
): option is Extract<
  IndicatorsGroupingSelectOption,
  { kind: 'question' } | { kind: 'structural' }
> {
  return option.kind === 'question' || option.kind === 'structural';
}
