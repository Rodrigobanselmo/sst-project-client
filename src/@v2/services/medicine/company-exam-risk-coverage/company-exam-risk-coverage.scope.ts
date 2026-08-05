/**
 * Client extension point for future "Visualizar empresa inteira".
 * See API `company-exam-risk-coverage.scope.extension.ts`.
 *
 * When implementing:
 * - Add UI toggle near ExamRiskWorkspaceContextBanner
 * - Pass `coverageScope: 'workspace' | 'company'` into browse/detail hooks
 * - Do not overload `workspaceId === undefined` as company-wide
 */
export type ExamRiskCoverageViewScope = 'workspace' | 'company';

export const EXAM_RISK_COVERAGE_VIEW_SCOPE_DEFAULT: ExamRiskCoverageViewScope =
  'workspace';
