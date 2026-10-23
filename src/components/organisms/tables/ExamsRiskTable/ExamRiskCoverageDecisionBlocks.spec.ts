jest.mock('./exam-risk-inline-parameter.util', () => ({ loadInlineRiskLinks: jest.fn() }));
jest.mock('react-query', () => ({ useQuery: jest.fn(() => ({ data: undefined })) }));
jest.mock('core/services/hooks/mutations/checklist/exams/useMutBulkUpdateExamRisk/useMutBulkUpdateExamRisk', () => ({ useMutBulkUpdateExamRisk: () => ({ isLoading: false, mutateAsync: jest.fn() }) }));
import React from 'react';
import { coverageAiOpenOptions } from './exam-risk-ai-coverage-context.util';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskCoverageDecisionBlocks } from './ExamRiskCoverageDecisionBlocks';
import { useAuthShow } from 'components/molecules/SAuthShow';
jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock(
  '@mui/material',
  () =>
    new Proxy(
      {},
      {
        get: (_, key) =>
          key === '__esModule'
            ? true
            : (props: any) => {
                if (key === 'Button') mockButtons.push(props);
                if (key === 'Chip') mockChips.push(props);
                if (key === 'Tooltip') mockTooltips.push(props);
                return React.createElement('div', null, props.children);
              },
      },
    ),
);
jest.mock('components/atoms/STable/components/Rows/IconButtonRow', () => ({
  __esModule: true,
  default: (props: any) => {
    if (props.tooltipTitle === 'Adicionar exame') mockAddProps = props;
    else mockAiProps = props;
    return React.createElement('button', { 'aria-label': props['aria-label'] });
  },
}));
jest.mock('./ExamRiskOverviewComparison', () => ({
  ExamRiskOverviewComparison: jest.fn(() => null),
}));
jest.mock('./ExamRiskCoverageDetailDrawer', () => ({
  ExamBlock: jest.fn(() => null),
}));
jest.mock(
  '@v2/services/medicine/company-exam-risk-coverage/hooks/useFetchCompanyExamRiskCoverageDetail',
  () => ({ useFetchCompanyExamRiskCoverageDetail: jest.fn() }),
);
let mockAddProps: any;
let mockAiProps: any;
let mockButtons: any[] = [];
let mockChips: any[] = [];
let mockTooltips: any[] = [];
const item = {
  riskId: 'risk',
  riskName: 'Tolueno',
  riskGroup: { id: 'CHEMICAL' },
  coverageStatus: 'MISSING_RECOMMENDED_EXAMS',
  adoptedCount: 1,
  hasAnyAdoptedExam: true,
  missingCount: 1,
  recommendedCount: 2,
  missingRecommendedExams: [{}],
} as any;
const onAddLink = jest.fn();
const props = {
  companyId: 'company',
  items: [item],
  onAddLink,
  onEditLink: jest.fn(),
  onViewCoverage: jest.fn(),
  onCompleteCoverage: jest.fn(),
  onReviewWithAi: jest.fn(),
};
beforeEach(() => {
  jest.clearAllMocks();
  mockAddProps = undefined;
  mockAiProps = undefined;
  mockButtons = [];
  mockChips = [];
  mockTooltips = [];
  (useAuthShow as jest.Mock).mockReturnValue({
    isAuthSuccess: ({ cruds }: any) => cruds === 'c',
  });
});
it.each([
  'analyzed',
  'partiallyAdopted',
  'recommendationAvailable',
  'complete',
  'localOnly',
  'noLibraryRecommendation',
  'recommendedWithoutAdoptedExam',
])('offers the same add callback in %s', (activeFilter) => {
  const html = renderToStaticMarkup(
    React.createElement(ExamRiskCoverageDecisionBlocks, {
      ...props,
      activeFilter: activeFilter as any,
    }),
  );
  expect(html).toContain('Adicionar exame a Tolueno');
  expect(html).not.toContain('Configurar manualmente');
  const stopPropagation = jest.fn();
  mockAddProps.onClick({ stopPropagation });
  expect(stopPropagation).toHaveBeenCalled();
  expect(onAddLink).toHaveBeenCalledWith(item);
});
it('hides add for users without create permission', () => {
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
  const html = renderToStaticMarkup(
    React.createElement(ExamRiskCoverageDecisionBlocks, {
      ...props,
      activeFilter: 'partiallyAdopted',
    }),
  );
  expect(html).not.toContain('Adicionar exame a');
  expect(onAddLink).not.toHaveBeenCalled();
});

it.each([true, false])(
  'preserves AI and permission-gated add for a risk without recommendations (create=%s)',
  (authorized) => {
    (useAuthShow as jest.Mock).mockReturnValue({
      isAuthSuccess: () => authorized,
    });
    const noRecommendation = {
      ...item,
      coverageStatus: 'NO_LIBRARY_RECOMMENDATION',
      adoptedCount: 0,
      recommendedCount: 0,
      missingCount: 0,
      missingRecommendedExams: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(ExamRiskCoverageDecisionBlocks, {
        ...props,
        items: [noRecommendation],
        activeFilter: 'noLibraryRecommendation',
      }),
    );
    expect(renderToStaticMarkup(mockAiProps.tooltipTitle)).toContain('Revisão de exames com IA');
    expect(html).not.toContain('Cadastrar manualmente');
    expect(html.includes('Adicionar exame a Tolueno')).toBe(authorized);
    if (authorized) {
      mockAddProps.onClick({ stopPropagation: jest.fn() });
      expect(onAddLink).toHaveBeenCalledWith(noRecommendation);
    }
  },
);

import { useFetchCompanyExamRiskCoverageDetail } from '@v2/services/medicine/company-exam-risk-coverage/hooks/useFetchCompanyExamRiskCoverageDetail';
import { ExamRiskOverviewComparison } from './ExamRiskOverviewComparison';
import { ExamBlock } from './ExamRiskCoverageDetailDrawer';
const renderExpanded = (data: any, activeFilter: any) => {
  (useFetchCompanyExamRiskCoverageDetail as jest.Mock).mockReturnValue({
    data,
  });
  const state = jest
    .spyOn(React, 'useState')
    .mockImplementationOnce(() => ['risk', jest.fn()] as any);
  try {
    return renderToStaticMarkup(
      React.createElement(ExamRiskCoverageDecisionBlocks, {
        ...props,
        items: [data],
        activeFilter,
      }),
    );
  } finally {
    state.mockRestore();
  }
};
it.each([
  [0, 3, 'analyzed'],
  [2, 1, 'analyzed'],
  [3, 0, 'analyzed'],
  [0, 3, 'recommendationAvailable'],
  [2, 1, 'partiallyAdopted'],
  [3, 0, 'complete'],
])(
  'expanded risk (%s adopted / %s pending in %s) keeps the shared batch action',
  (adopted, pending, filter) => {
    const detail = {
      ...item,
      adoptedCount: adopted,
      hasAnyAdoptedExam: adopted > 0,
      coverageStatus: pending ? 'MISSING_RECOMMENDED_EXAMS' : 'COMPLETE',
      missingCount: pending,
      missingRecommendedExams: Array.from({ length: pending }, (_, index) => ({
        examId: index + 1,
        examName: `Exam ${index}`,
      })),
      adoptedExams: [],
      recommendedExams: [{ examId: 99, examName: 'Recomendação' }],
    };
    const html = renderExpanded(detail, filter);
    const actions = mockButtons.filter(
      (button) => button.children === 'Adotar exames recomendados',
    );
    expect(actions).toHaveLength(pending ? 1 : 0);
    if (pending) {
      actions[0].onClick();
      expect(props.onCompleteCoverage).toHaveBeenCalledWith(detail);
    }
    expect(html).not.toContain('Ver recomendação');
    expect(html).not.toContain('Adotar padrão');
    if (filter === 'analyzed') {
      expect(ExamRiskOverviewComparison).toHaveBeenCalled();
      expect(ExamBlock).not.toHaveBeenCalled();
    } else {
      expect(ExamBlock).toHaveBeenCalled();
      expect(ExamRiskOverviewComparison).not.toHaveBeenCalled();
    }
  },
);
it('does not offer batch adoption without create permission', () => {
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
  renderExpanded(
    { ...item, adoptedExams: [], recommendedExams: [] },
    'analyzed',
  );
  expect(
    mockButtons.filter((button) => button.children === 'Adotar exames recomendados'),
  ).toHaveLength(0);
});
it.each(['analyzed', 'recommendationAvailable'])('describes exactly the pending batch selection in an accessible scrollable tooltip (%s)', filter => {
 const missing = Array.from({ length: 30 }, (_, index) => ({ examId: index + 1, examName: `Exame pendente ${index + 1}` }));
 const detail = { ...item, missingRecommendedExams: missing, adoptedExams: [{ examId: 100, examName: 'Exame já adotado' }], recommendedExams: [...missing, { examId: 101, examName: 'Exame não adotado por decisão', adoptionState: 'NOT_ADOPTED' }] };
 renderExpanded(detail, filter);
 const tooltip = mockTooltips[0];
 expect(tooltip.describeChild).toBe(true);
 expect(tooltip.disableInteractive).toBe(false);
 // The native Button remains focusable, and MUI Tooltip retains its default focus listener.
 expect(tooltip.disableFocusListener).not.toBe(true);
 expect(tooltip.children.props.children).toBe('Adotar exames recomendados');
 expect(tooltip.children.props.disabled).not.toBe(true);
 const content = renderToStaticMarkup(tooltip.title);
 for (const exam of missing) expect(content).toContain(exam.examName);
 expect(content).not.toContain('Exame já adotado');
 expect(content).not.toContain('Exame não adotado por decisão');
 expect(content).toContain('estabelecimento selecionado');
 expect(content).toContain('selecionar ou desmarcar');
 expect(content).toContain('recomendações inelegíveis');
 const listRegion = tooltip.title.props.children[3];
 expect(listRegion.props.tabIndex).toBe(0);
 expect(listRegion.props.sx).toMatchObject({ maxHeight: 200, overflowY: 'auto' });
 mockButtons.find(button => button.children === 'Adotar exames recomendados').onClick();
 expect(props.onCompleteCoverage).toHaveBeenCalledWith(detail);
});


it('keeps tooltip typography readable on the local dark surface without theme changes', () => {
 renderExpanded({ ...item, adoptedExams: [], recommendedExams: [] }, 'analyzed');
 const tooltip = mockTooltips[0];
 expect(tooltip.componentsProps.tooltip.sx).toMatchObject({ bgcolor: '#30343B', color: '#F5F5F5', maxWidth: 420, p: 2 });
 const children = tooltip.title.props.children;
 expect(children[0].props.sx).toMatchObject({ color: '#FFFFFF', fontWeight: 700 });
 expect(children[1].props.sx).toMatchObject({ color: 'inherit' });
 expect(children[2].props.sx).toMatchObject({ color: '#FFFFFF', fontWeight: 700 });
 expect(children[4].props.sx).toMatchObject({ color: 'inherit', borderTop: '1px solid rgba(255, 255, 255, 0.22)' });
 expect(children[3].props.children.props.sx['& li']).toMatchObject({ py: 0.375, lineHeight: 1.5, color: 'inherit' });
 expect(tooltip.disableFocusListener).not.toBe(true);
});

it.each(['analyzed', 'complete'])('removes Ver cobertura while preserving expansion and the status drawer access (%s)', (filter) => {
  const detail = { ...item, coverageStatus: 'COMPLETE', missingCount: 0, missingRecommendedExams: [], adoptedExams: [], recommendedExams: [] };
  renderExpanded(detail, filter);
  expect(mockButtons.some((button) => button.children === 'Ver cobertura')).toBe(false);
  expect(mockChips.find(chip => chip.onClick).onClick).toEqual(expect.any(Function));
  mockChips.find(chip => chip.onClick).onClick();
  expect(props.onViewCoverage).toHaveBeenCalledWith('risk');
  expect(mockAddProps).toBeDefined();
});

it.each(['analyzed', 'complete', 'partiallyAdopted', 'recommendationAvailable', 'localOnly', 'noLibraryRecommendation', 'recommendedWithoutAdoptedExam'])('offers one AI icon and preserves status drawer without an Actions column (%s)', (filter) => {
  const html = renderToStaticMarkup(React.createElement(ExamRiskCoverageDecisionBlocks, { ...props, activeFilter: filter as any }));
  expect(html).not.toContain('Ações');
  expect(html).not.toMatch(/Revisar com IA|Analisar com IA|Revisar pendências com IA|Ver pendências|Ver vínculo|Manter como está/);
  expect(mockAiProps['aria-label']).toContain(item.riskName);
  const stopPropagation = jest.fn();
  mockAiProps.onClick({ stopPropagation });
  expect(stopPropagation).toHaveBeenCalled();
  expect(props.onReviewWithAi).toHaveBeenCalledWith(item);
  mockChips.find(chip => chip.onClick).onClick();
  expect(props.onViewCoverage).toHaveBeenCalledWith(item.riskId);
});
it.each([
  [false, 0, 'COMPLETE', 'SUGGEST'],
  [false, 0, 'MISSING_RECOMMENDED_EXAMS', 'SUGGEST'],
  [true, 2, 'MISSING_RECOMMENDED_EXAMS', 'REVIEW'],
  [true, 3, 'COMPLETE', 'REVIEW'],
  [true, 1, 'LOCAL_ONLY', 'REVIEW'],
])('selects AI mode from actual links (%s, %s, %s)', (hasAnyAdoptedExam, adoptedCount, coverageStatus, mode) => {
  expect(coverageAiOpenOptions({ ...item, hasAnyAdoptedExam, adoptedCount, coverageStatus })).toEqual({ mode, autoStart: false });
});

it.each([false, true])('shows contextual AI tooltip for existing links=%s', (hasAnyAdoptedExam) => {
  const html = renderToStaticMarkup(React.createElement(ExamRiskCoverageDecisionBlocks, { ...props, items: [{ ...item, hasAnyAdoptedExam }], activeFilter: 'analyzed' }));
  const tooltip = renderToStaticMarkup(mockAiProps.tooltipTitle);
  expect(tooltip).toContain(hasAnyAdoptedExam ? 'Revisão de exames com IA' : 'Análise inicial com IA');
  expect(tooltip).toContain(hasAnyAdoptedExam ? 'Nenhuma alteração será aplicada automaticamente.' : 'Nenhum exame será adicionado sem sua confirmação.');
  expect(html.indexOf(mockAiProps['aria-label'])).toBeLessThan(html.indexOf('Tolueno</div>'));
});

it('clears selection and closes batch editing on scope and P/FRO changes', () => {
 const effects: { callback: () => void; deps: any[] }[] = [];
 const setter = jest.fn();
 const state = jest.spyOn(React, 'useState').mockImplementation((initial: any) => [initial, setter] as any);
 const effect = jest.spyOn(React, 'useEffect').mockImplementation((callback: any, deps: any) => { effects.push({ callback, deps }); });
 try {
   renderToStaticMarkup(React.createElement(ExamRiskCoverageDecisionBlocks, { ...props, workspaceId: 'workspace', activeFilter: 'analyzed' }));
   const reset = effects.find(entry => JSON.stringify(entry.deps) === JSON.stringify(['company', 'workspace', 'analyzed', '']));
   expect(reset).toBeDefined(); reset!.callback();
   expect(setter).toHaveBeenCalledWith([]); expect(setter).toHaveBeenCalledWith(false);
 } finally { state.mockRestore(); effect.mockRestore(); }
});
