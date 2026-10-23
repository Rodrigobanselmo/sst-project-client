let mockButtonProps: any;
jest.mock('@mui/material', () => ({
  Button: (props: any) => {
    mockButtonProps = props;
    return require('react').createElement(
      'button',
      { disabled: props.disabled, 'aria-label': props['aria-label'] },
      props.children,
    );
  },
  Typography: ({ children }: any) =>
    require('react').createElement('span', null, children),
}));
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskAdoptExam } from './ExamRiskAdoptExam';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { fetchCompanyExamRiskCoverageDetail } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.service';
jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock(
  '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.service',
  () => ({ fetchCompanyExamRiskCoverageDetail: jest.fn() }),
);
const exam = {
  examId: 69,
  examName: 'O-cresol',
  isMissing: true,
  isAdopted: false,
} as any;
const onAdopt = jest.fn();
const render = (overrides = {}) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskAdoptExam, {
      companyId: 'company',
      workspaceId: 'workspace',
      riskId: 'risk',
      exam,
      onAdopt,
      ...overrides,
    }),
  );
beforeEach(() => jest.clearAllMocks());
it('renders for create permission without opening or saving on render', () => {
  const auth = jest.fn(({ cruds }) => cruds === 'c');
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: auth });
  expect(render()).toContain('Adotar exame O-cresol');
  expect(auth).toHaveBeenCalledWith(expect.objectContaining({ cruds: 'c' }));
  expect(fetchCompanyExamRiskCoverageDetail).not.toHaveBeenCalled();
  expect(onAdopt).not.toHaveBeenCalled();
});
it('hides for update-only users or recommendations already adopted', () => {
  (useAuthShow as jest.Mock).mockReturnValue({
    isAuthSuccess: ({ cruds }) => cruds === 'u',
  });
  expect(render()).toBe('');
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  expect(render({ exam: { ...exam, isMissing: false, isAdopted: true } })).toBe(
    '',
  );
  expect(render({ exam: { ...exam, examId: 0 } })).toBe('');
  expect(render({ onAdopt: undefined })).toBe('');
});

it('revalidates exact IDs before opening, passes the fresh configuration and prevents duplicate clicks', async () => {
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  const freshExam = { ...exam, config: { validityInMonths: 24 } };
  const detail = {
    riskId: 'risk',
    recommendedExams: [freshExam],
    missingRecommendedExams: [freshExam],
    adoptedExams: [],
  };
  (fetchCompanyExamRiskCoverageDetail as jest.Mock).mockResolvedValue(detail);
  render();
  const event = { stopPropagation: jest.fn() };
  mockButtonProps.onClick(event);
  mockButtonProps.onClick(event);
  await Promise.resolve();
  expect(fetchCompanyExamRiskCoverageDetail).toHaveBeenCalledTimes(1);
  expect(fetchCompanyExamRiskCoverageDetail).toHaveBeenCalledWith({
    companyId: 'company',
    workspaceId: 'workspace',
    riskId: 'risk',
    onlyPcmso: true,
  });
  expect(onAdopt).toHaveBeenCalledWith(detail, freshExam);
  expect(event.stopPropagation).toHaveBeenCalled();
});
it('does not open when the refreshed recommendation is adopted or the request fails', async () => {
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  (fetchCompanyExamRiskCoverageDetail as jest.Mock).mockResolvedValue({
    riskId: 'risk',
    recommendedExams: [{ ...exam, isMissing: false, isAdopted: true }],
    missingRecommendedExams: [],
    adoptedExams: [],
  });
  render();
  mockButtonProps.onClick({ stopPropagation: jest.fn() });
  await Promise.resolve();
  expect(onAdopt).not.toHaveBeenCalled();
  (fetchCompanyExamRiskCoverageDetail as jest.Mock).mockRejectedValue(
    new Error('Falha de consulta'),
  );
  render();
  mockButtonProps.onClick({ stopPropagation: jest.fn() });
  await Promise.resolve();
  expect(onAdopt).not.toHaveBeenCalled();
});

it('opens the same creation flow for a valid non-adoption without prior reconsideration', async () => {
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  const declined = { ...exam, isMissing: false, adoptionState: 'NOT_ADOPTED', nonAdoptionDecision: { valid: true }, config: { validityInMonths: 12 } };
  const detail = { riskId: 'risk', recommendedExams: [declined], missingRecommendedExams: [], adoptedExams: [] };
  (fetchCompanyExamRiskCoverageDetail as jest.Mock).mockResolvedValue(detail);
  render({ exam: declined });
  mockButtonProps.onClick({ stopPropagation: jest.fn() });
  await Promise.resolve();
  expect(onAdopt).toHaveBeenCalledWith(detail, declined);
});


it('keeps adoption compact with a decorative green circle', () => {
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  render();
  expect(mockButtonProps.color).toBe('success');
  expect(mockButtonProps.size).toBe('small');
  expect(mockButtonProps.startIcon.props['aria-hidden']).toBe('true');
  expect(mockButtonProps.startIcon.props.style).toMatchObject({ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'currentColor' });
});
