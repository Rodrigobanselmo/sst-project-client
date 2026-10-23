jest.mock('./ExamRiskDeleteLibrary', () => ({ ExamRiskDeleteLibrary: () => null }));
jest.mock('core/services/hooks/mutations/checklist/exams/useMutDeleteExamRisk/useMutDeleteExamRisk', () => ({ useMutDeleteExamRisk: () => ({ mutateAsync: jest.fn(), isLoading: false }) }));
jest.mock('@v2/services/medicine/company-exam-risk-coverage/publish-persisted-exam-risk.service', () => ({ publishPersistedExamRisk: jest.fn() }));
jest.mock('@v2/services/medicine/company-exam-risk-recommendation-decision/company-exam-risk-recommendation-decision.service', () => ({ fetchExamRiskRecommendationDecisions: jest.fn(), updateExamRiskRecommendationDecision: jest.fn() }));
jest.mock(
  '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.service',
  () => ({ fetchCompanyExamRiskCoverageDetail: jest.fn() }),
);
import { ExamRiskSynchronizeAll } from './ExamRiskSynchronizeAll';
jest.mock('./ExamRiskSynchronizeAll', () => ({
  ExamRiskSynchronizeAll: jest.fn(() => null),
}));
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { useExamRiskParameterReviews } from './useExamRiskParameterReviews';
import { ExamRiskOverviewComparison } from './ExamRiskOverviewComparison';

jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock('./useExamRiskParameterReviews', () => ({
  useExamRiskParameterReviews: jest.fn(),
}));
jest.mock('react-query', () => ({
  useQuery: () => ({
    data: [283, 284].map((id) => ({
      id,
      examId: 12,
      riskId: 'risk',
      companyId: 'company',
    })),
    refetch: jest.fn(),
  }),
}));
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
jest.mock(
  'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk',
  () => ({ queryExams: jest.fn() }),
);
jest.mock('core/services/queryClient', () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
jest.mock(
  '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status',
  () => ({ refetchExamRiskLinkStatusQueries: jest.fn() }),
);
jest.mock('./exam-risk-inline-parameter.util', () => ({
  ...jest.requireActual('./exam-risk-inline-parameter.util'),
  loadInlineRiskLinks: jest.fn(),
}));
jest.mock('./ExamRiskOverviewEditLink', () => ({
  ExamRiskOverviewEditLink: ({ label, iconOnly, exam }) => iconOnly ? require('react').createElement('button', { 'aria-label': `Editar vínculo ${exam.linkId}` }) : label,
}));
jest.mock('./ExamRiskInlineParameter', () => ({
  ExamRiskInlineParameter: (props) => {
    const React = require('react');
    return React.createElement(
      React.Fragment,
      null,
      props.prefix(() => {}),
      props.confirmedText,
    );
  },
}));
jest.mock('./ExamRiskLibraryInlineParameter', () => ({
  ExamRiskLibraryInlineParameter: (props) => {
    const React = require('react');
    return React.createElement(
      React.Fragment,
      null,
      props.prefix(() => {}),
      props.confirmedText,
    );
  },
}));
const left = {
  isAdmission: true,
  isPeriodic: true,
  isChange: true,
  isReturn: false,
  isDismissal: true,
  isMale: true,
  isFemale: true,
  fromAge: null,
  toAge: null,
  validityInMonths: 12,
  considerBetweenDays: 0,
  minRiskDegree: 3,
  minRiskDegreeQuantity: 4,
};
const right = { ...left, minRiskDegree: 4 };
function fixture() {
  const data: any = {
    quantitativeLimitApplicable: true,
    riskId: 'risk',
    riskName: 'Ruído',
    recommendedExams: [
      {
        examId: 69,
        examName: 'Audiometria',
        isAdopted: true,
        isMissing: false,
        config: left,
        recommendationSource: { ruleId: 'rule', ruleExamId: 'item' },
        matchedAdoptedLinks: [
          { linkId: 283, examId: 12 },
          { linkId: 284, examId: 12 },
        ],
      },
    ],
    adoptedExams: [283, 284].map((linkId) => ({
      linkId,
      examId: 12,
      examName: 'Audiometria',
      config: { ...right },
      isRecommendedByLibrary: true,
      isLocalOnly: false,
    })),
  };
  const response: any = {
    companyId: 'company',
    riskId: 'risk',
    comparisons: [283, 284].map((linkId) => ({
      companyId: 'company',
      riskId: 'risk',
      linkId,
      adoptedExamId: 12,
      recommendedExamId: 69,
      ruleId: 'rule',
      ruleExamId: 'item',
      groups: [
        {
          group: 'minRiskDegree',
          state: linkId === 283 ? 'ACCEPTED' : 'UNREVIEWED',
          canReview: true,
          canReopen: linkId === 283,
          snapshot: { recommended: [3], adopted: [4] },
        },
      ],
    })),
  };
  return { data, response };
}
const render = (data, onAdoptExam?: (item: any, exam: any) => void) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskOverviewComparison, {
      data,
      companyId: 'company',
      workspaceId: 'workspace',
      onEditLink: jest.fn(),
      onAdoptExam,
    }),
  );
describe('expanded overview composition (SSR with mocked editors/query hooks)', () => {
  beforeEach(() => {
    (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  });
  it('keeps both yellow copy shortcuts and separate decision actions for independent links', () => {
    const { data, response } = fixture();
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
      data: response,
      pending: false,
      refreshReviews: jest.fn(),
      save: jest.fn(),
    });
    const html = render(data);
    expect(html).toContain('Adotar valor da Biblioteca — Critério qualitativo');
    expect(html).toContain(
      'Atualizar Biblioteca com valor da empresa — Critério qualitativo',
    );
    expect(html).toContain(
      'Reabrir avaliação — Critério qualitativo, vínculo 283',
    );
    expect(html).toContain(
      'Aceitar divergência — Critério qualitativo, vínculo 284',
    );
    expect(html).toContain(
      'Divergência conhecida e aceita pela empresa. Não significa conformidade com a Biblioteca.',
    );
  });
  it('shows accepted status for read-only users without decision controls', () => {
    const { data, response } = fixture();
    (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
      data: response,
      pending: false,
    });
    const html = render(data);
    expect(html).toContain('Divergência conhecida e aceita pela empresa.');
    expect(html).not.toContain('Reabrir avaliação —');
    expect(html).not.toContain('Aceitar divergência —');
  });
  it('does not restore blue/actions from a response for different displayed values', () => {
    const { data, response } = fixture();
    data.adoptedExams.forEach((exam) => {
      exam.config.minRiskDegree = 5;
    });
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
      data: response,
      pending: false,
    });
    const html = render(data);
    expect(html).not.toContain('Reabrir avaliação —');
    expect(html).not.toContain('Aceitar divergência —');
    expect(html).not.toContain('Divergência conhecida e aceita pela empresa.');
  });
});

describe('explicitly absent values in the displayed comparison', () => {
  beforeEach(() => {
    (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
      pending: false,
    });
    (ExamRiskSynchronizeAll as jest.Mock).mockClear();
  });
  it.each([
    [90, null, true],
    [null, 90, true],
    [null, null, false],
    [0, null, true],
  ])(
    'interval %s x %s uses the same availability for indicators and sync',
    (left, right, different) => {
      const { data } = fixture();
      data.recommendedExams[0].config = {
        ...data.recommendedExams[0].config,
        considerBetweenDays: left,
      };
      data.adoptedExams.forEach((exam) => {
        exam.config.considerBetweenDays = right;
      });
      const html = render(data);
      if (different)
        expect(html).toContain(
          'Adotar valor da Biblioteca — Intervalo em dias',
        );
      else expect(html).toContain('Intervalo em dias: Valores correspondentes');
      const syncProps = (ExamRiskSynchronizeAll as jest.Mock).mock.calls[0][0];
      expect(syncProps.groups.includes('considerBetweenDays')).toBe(different);
    },
  );
  it('compares displayed values without provenance but blocks source-dependent operations', () => {
    const { data } = fixture();
    data.recommendedExams[0].recommendationSource = null;
    const html = render(data);
    expect(html).toContain('Eventos: Valores correspondentes');
    expect(html).toContain('Critério qualitativo: Valores diferentes');
    expect(html).not.toContain('Aceitar divergência —');
    expect(html).not.toContain('Reabrir avaliação —');
    expect(html).not.toContain('Atualizar Biblioteca com valor da empresa —');
    expect(
      (ExamRiskSynchronizeAll as jest.Mock).mock.calls[0][0].groups,
    ).toEqual([]);
  });
  it('shows accepted null divergence without losing the individual copy shortcut', () => {
    const { data, response } = fixture();
    data.recommendedExams[0].config = {
      ...data.recommendedExams[0].config,
      considerBetweenDays: 90,
    };
    data.adoptedExams[0].config.considerBetweenDays = null;
    response.comparisons[0].groups.push({
      group: 'considerBetweenDays',
      state: 'ACCEPTED',
      canReview: true,
      canReopen: true,
      snapshot: { recommended: [90], adopted: [null] },
    });
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
      data: response,
      pending: false,
    });
    const html = render(data);
    expect(html).toContain(
      'Reabrir avaliação — Intervalo em dias, vínculo 283',
    );
    expect(html).toContain('Adotar valor da Biblioteca — Intervalo em dias');
  });
});

describe('quantitative eligibility in the comparison', () => {
  beforeEach(() => {
    (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
      pending: false,
    });
    (ExamRiskSynchronizeAll as jest.Mock).mockClear();
  });
  it.each([false, undefined])(
    'does not show quantitative controls or indicators for eligibility %s',
    (eligibility) => {
      const { data, response } = fixture();
      data.quantitativeLimitApplicable = eligibility;
      data.recommendedExams[0].config = {
        ...left,
        minRiskDegreeQuantity: null,
      };
      data.adoptedExams.forEach((exam) => {
        exam.config.minRiskDegreeQuantity = 1;
      });
      response.comparisons[0].groups.push({
        group: 'minRiskDegreeQuantity',
        state: 'ACCEPTED',
        canReview: true,
        canReopen: true,
        snapshot: { recommended: [null], adopted: [1] },
      });
      (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
        data: response,
        pending: false,
      });
      const before = JSON.stringify(data);
      const html = render(data);
      expect(html).toContain(
        eligibility === false
          ? 'Não aplicável'
          : 'aplicabilidade não resolvida',
      );
      if (eligibility === undefined)
        expect(html).not.toContain('Não aplicável');
      expect(html).not.toContain('— Critério quantitativo');
      expect(html).not.toContain('Critério quantitativo: Valores');
      for (const [props] of (ExamRiskSynchronizeAll as jest.Mock).mock.calls) {
        expect(props.groups).not.toContain('minRiskDegreeQuantity');
        expect(props.quantitativeLimitApplicable).toBe(eligibility);
      }
      expect(JSON.stringify(data)).toBe(before);
    },
  );
  it('preserves applicable quantitative null/value comparison, copying and acceptance', () => {
    const { data, response } = fixture();
    data.recommendedExams[0].config = { ...left, minRiskDegreeQuantity: null };
    data.adoptedExams[0].config.minRiskDegreeQuantity = 1;
    response.comparisons[0].groups.push({
      group: 'minRiskDegreeQuantity',
      state: 'UNREVIEWED',
      canReview: true,
      snapshot: { recommended: [null], adopted: [1] },
    });
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
      data: response,
      pending: false,
    });
    const html = render(data);
    expect(html).toContain(
      'Adotar valor da Biblioteca — Critério quantitativo',
    );
    expect(html).toContain(
      'Aceitar divergência — Critério quantitativo, vínculo 283',
    );
    expect(
      (ExamRiskSynchronizeAll as jest.Mock).mock.calls[0][0].groups,
    ).toContain('minRiskDegreeQuantity');
  });
});

it('offers adoption only on an unmatched pending company column with create permission', () => {
  const { data } = fixture();
  const onAdopt = jest.fn();
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  (useExamRiskParameterReviews as jest.Mock).mockReturnValue({
    pending: false,
  });
  expect(render(data, onAdopt)).not.toContain('Adotar exame Audiometria');
  data.adoptedExams = [];
  data.recommendedExams[0] = {
    ...data.recommendedExams[0],
    isAdopted: false,
    isMissing: true,
    matchedAdoptedLinks: [],
  };
  expect(render(data, onAdopt)).toContain('Adotar exame Audiometria');
  (useAuthShow as jest.Mock).mockReturnValue({
    isAuthSuccess: ({ cruds }) => cruds === 'u',
  });
  expect(render(data, onAdopt)).not.toContain('Adotar exame Audiometria');
});

it('keeps non-adoptions visible, separates counts and preserves the individual adoption action', () => {
  const { data } = fixture();
  Object.assign(data, { adoptedCount: 0, missingCount: 0, notAdoptedCount: 1, adoptedExams: [] });
  Object.assign(data.recommendedExams[0], { isAdopted: false, isMissing: false, adoptionState: 'NOT_ADOPTED', matchedAdoptedLinks: [], nonAdoptionDecision: { fingerprint: 'a'.repeat(64), version: 'version', active: true, valid: true, reason: 'Motivo próprio' } });
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false, refreshReviews: jest.fn() });
  const html = render(data, jest.fn());
  expect(html).toContain('Não adotado por decisão da empresa');
  expect(html).toContain('Motivo: Motivo próprio');
  expect(html).toContain('Reconsiderar decisão');
  expect(html).toContain('Adotar exame Audiometria');
  expect(html).not.toContain('Pendente de adoção');
  expect(html).toContain('0 adotados');
  expect(html).toContain('1 não adotado por decisão da empresa');
  expect(html).toContain('0 pendentes');
  expect(html).not.toContain('Aceitar divergência —');
});

describe('informative comparison structural safety', () => {
  beforeEach(() => {
    (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  });
  it('ignores a previously accepted response when the displayed source is absent', () => {
    const { data, response } = fixture();
    data.recommendedExams[0].recommendationSource = null;
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ data: response, pending: false });
    const html = render(data);
    expect(html).toContain('Critério qualitativo: Valores diferentes');
    expect(html).not.toContain('Divergência conhecida e aceita pela empresa.');
    expect(html).not.toContain('Reabrir avaliação —');
    expect(html).not.toContain('Aceitar divergência —');
  });
  it('keeps only the ill-typed group unavailable, including with ambiguous provenance', () => {
    const { data } = fixture();
    data.recommendedExams[0].recommendationSource = null;
    data.recommendedExams[0].config = { ...left, validityInMonths: undefined };
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
    const html = render(data);
    expect(html).toContain('Periodicidade: Comparação indisponível');
    expect(html).toContain('Eventos: Valores correspondentes');
    expect(html).toContain('Sexo: Valores correspondentes');
    expect(html).toContain('Faixa etária: Valores correspondentes');
    expect(html).toContain('Intervalo em dias: Valores correspondentes');
    expect(html).toContain('Critério qualitativo: Valores diferentes');
    expect(html).toContain('Critério quantitativo: Valores correspondentes');
  });
  it('does not compare when two recommendations claim the same adopted link', () => {
    const { data } = fixture();
    data.recommendedExams.push({ ...data.recommendedExams[0], examId: 70 });
    (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
    const html = render(data);
    expect(html).toContain('Eventos: Comparação indisponível');
    expect(html).not.toContain('Eventos: Valores correspondentes');
    expect(html).not.toContain('Critério qualitativo: Valores diferentes');
  });
});


it('places one header pencil per adopted link only for update permission', () => {
  const { data } = fixture();
  (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  expect(render(data)).toContain('Editar vínculo 283');
  expect(render(data)).toContain('Editar vínculo 284');
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
  expect(render(data)).not.toContain('Editar vínculo');
  (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
  data.adoptedExams = [];
  data.recommendedExams[0].matchedAdoptedLinks = [];
  expect(render(data)).not.toContain('Editar vínculo');
});

it('offers publication in the library column only for MASTER and adopted local exams without recommendation', () => {
 const { data } = fixture();
 data.recommendedExams = [];
 data.adoptedExams = [ { ...data.adoptedExams[0], isLocalOnly: true, isRecommendedByLibrary: false } ];
 (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
 (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true, isMasterAdmin: true });
 expect(render(data)).toContain('+ Publicar na Biblioteca');
 (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true, isMasterAdmin: false });
 expect(render(data)).not.toContain('+ Publicar na Biblioteca');
 (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true, isMasterAdmin: true });
 expect(render(fixture().data)).not.toContain('+ Publicar na Biblioteca');
});

it('offers delete by exact link and keeps the recommendation visible after the last adoption disappears', () => {
 const { data } = fixture();
 (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => true });
 (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
 const before = render(data);
 expect(before).toContain('Excluir Audiometria, vínculo 283');
 expect(before).toContain('Excluir Audiometria, vínculo 284');
 data.adoptedExams = [];
 data.recommendedExams[0].matchedAdoptedLinks = [];
 const after = render(data);
 expect(after).not.toContain('Excluir Audiometria');
 expect(after).toContain('Audiometria');
 expect(after).toContain('Recomendado pela Biblioteca');
 expect(after).toContain('Sem exame adotado correspondente neste detalhe.');
});
it('hides delete when update is allowed but delete permission is absent', () => {
 (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: ({ cruds }) => cruds === 'u' });
 (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
 const html = render(fixture().data);
 expect(html).toContain('Editar vínculo 283');
 expect(html).not.toContain('Excluir Audiometria');
});


it('exposes recommendation notes in the library information icon', () => {
 const { data } = fixture();
 data.recommendedExams[0].notes = ['Regra ACTIVE por identidade eSocial T27 (rule)', 'Coleta ao final da jornada.'];
 (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
 (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
 const html = render(data);
 expect(html).not.toContain('Regra ACTIVE');
 expect(html).toContain('Coleta ao final da jornada.');
 expect(html).not.toContain('Comparação informativa dos parâmetros.');
});

it('preserves the objective coverage summary without the permanent explanatory paragraph', () => {
 const { data } = fixture(); data.adoptedCount = 2; data.notAdoptedCount = 1; data.missingCount = 3;
 (useAuthShow as jest.Mock).mockReturnValue({ isAuthSuccess: () => false });
 (useExamRiskParameterReviews as jest.Mock).mockReturnValue({ pending: false });
 const html = render(data);
 expect(html).toContain('2 adotados · 1 não adotado por decisão da empresa · 3 pendentes');
 expect(html).not.toContain('Os indicadores não representam');
});
