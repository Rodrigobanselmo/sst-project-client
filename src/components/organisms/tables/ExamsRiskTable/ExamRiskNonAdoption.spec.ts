let mockAutocompleteProps: any;
let mockTextFieldProps: any;
let mockButtons: any[] = [];
let mockEditing: any = null;
let mockReason = '';
let mockStateIndex = 0;
const mockSetEditing = jest.fn();
const mockSetReason = jest.fn();
const mockSetPending = jest.fn();
const mockSetError = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: () => {
    const index = mockStateIndex++;
    return [
      [mockEditing, mockSetEditing],
      [mockReason, mockSetReason],
      [false, mockSetPending],
      ['', mockSetError],
    ][index];
  },
}));
jest.mock('@mui/material', () => ({
  Box: ({ children }: any) =>
    require('react').createElement('div', null, children),
  Typography: ({ children }: any) =>
    require('react').createElement('span', null, children),
  Button: (props: any) => {
    mockButtons.push(props);
    return require('react').createElement(
      'button',
      { disabled: props.disabled },
      props.children,
    );
  },
  Autocomplete: (props: any) => {
    mockAutocompleteProps = props;
    return props.renderInput({ inputProps: {} });
  },
  TextField: (props: any) => {
    mockTextFieldProps = props;
    return require('react').createElement('input', {
      'aria-label': props.label,
      readOnly: true,
    });
  },
}));
jest.mock('@mui/icons-material/InfoOutlined', () => () => null);
jest.mock(
  '@v2/services/medicine/company-exam-risk-recommendation-decision/company-exam-risk-recommendation-decision.service',
  () => ({
    fetchExamRiskRecommendationDecisions: jest.fn(),
    updateExamRiskRecommendationDecision: jest.fn(),
  }),
);
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ExamRiskNonAdoption,
  nonAdoptionReasonSuggestions,
} from './ExamRiskNonAdoption';
import {
  fetchExamRiskRecommendationDecisions,
  updateExamRiskRecommendationDecision,
} from '@v2/services/medicine/company-exam-risk-recommendation-decision/company-exam-risk-recommendation-decision.service';
const exam = {
  examId: 69,
  examName: 'Exame',
  isAdopted: false,
  isMissing: true,
  config: {},
  recommendationSource: { ruleId: 'rule', ruleExamId: 'item' },
  nonAdoptionDecision: {
    fingerprint: 'a'.repeat(64),
    version: null,
    active: false,
    valid: false,
  },
} as any;
const onSaved = jest.fn(async () => {}),
  onMessage = jest.fn();
const render = (extra = {}) => {
  mockButtons = [];
  mockStateIndex = 0;
  return renderToStaticMarkup(
    React.createElement(ExamRiskNonAdoption, {
      companyId: 'company',
      workspaceId: 'workspace',
      riskId: 'risk',
      exam,
      canUpdate: true,
      onSaved,
      onMessage,
      ...extra,
    }),
  );
};
const click = async (text: string) => {
  mockButtons.find((button) => button.children === text).onClick();
  await new Promise((resolve) => setImmediate(resolve));
};
beforeEach(() => {
  jest.clearAllMocks();
  mockEditing = null;
  mockReason = '';
  (fetchExamRiskRecommendationDecisions as jest.Mock).mockResolvedValue({
    riskId: 'risk',
    recommendedExams: [exam],
  });
  (updateExamRiskRecommendationDecision as jest.Mock).mockResolvedValue({});
});
it('shows action only for authorized, available workspace comparisons', () => {
  expect(render()).toContain('Não adotar');
  expect(render({ canUpdate: false })).not.toContain('<button');
  expect(render({ workspaceId: undefined })).not.toContain('<button');
  expect(
    render({ exam: { ...exam, recommendationSource: null } }),
  ).not.toContain('<button');
  expect(render({ exam: { ...exam, isAdopted: true } })).toBe('');
  expect(updateExamRiskRecommendationDecision).not.toHaveBeenCalled();
});
it('revalidates GET on open without saving and blocks repeated clicks', async () => {
  render();
  const button = mockButtons[0];
  button.onClick();
  button.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  expect(fetchExamRiskRecommendationDecisions).toHaveBeenCalledTimes(1);
  expect(mockSetEditing).toHaveBeenCalledWith(exam);
  expect(updateExamRiskRecommendationDecision).not.toHaveBeenCalled();
});
it.each(['', 'Motivo próprio'])(
  'saves optional reason %s, only after confirmation, then refreshes',
  async (reason) => {
    mockEditing = exam;
    mockReason = reason;
    expect(render()).toContain('Motivo da não adoção (opcional)');
    await click('Registrar');
    expect(updateExamRiskRecommendationDecision).toHaveBeenCalledWith(
      { companyId: 'company', workspaceId: 'workspace', riskId: 'risk' },
      expect.objectContaining({
        action: 'DECLINE',
        reason: reason || null,
        expectedVersion: null,
        expectedFingerprint: 'a'.repeat(64),
        ruleExamId: 'item',
        recommendedExamId: 69,
      }),
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  },
);
it('cancel does not write', async () => {
  mockEditing = exam;
  render();
  await click('Cancelar');
  expect(mockSetEditing).toHaveBeenCalledWith(null);
  expect(updateExamRiskRecommendationDecision).not.toHaveBeenCalled();
});
it('renders valid decision for read-only users and reconsiders with current version', async () => {
  const declined = {
    ...exam,
    isMissing: false,
    adoptionState: 'NOT_ADOPTED',
    nonAdoptionDecision: {
      ...exam.nonAdoptionDecision,
      active: true,
      valid: true,
      version: 'version',
    },
  };
  expect(render({ exam: declined, canUpdate: false })).toContain(
    'Não adotado por decisão da empresa',
  );
  expect(render({ exam: declined, canUpdate: false })).toContain(
    'Motivo: não informado',
  );
  expect(render({ exam: declined, canUpdate: false })).not.toContain('<button');
  (fetchExamRiskRecommendationDecisions as jest.Mock).mockResolvedValue({
    riskId: 'risk',
    recommendedExams: [declined],
  });
  render({ exam: declined });
  await click('Reconsiderar decisão');
  expect(updateExamRiskRecommendationDecision).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      action: 'RECONSIDER',
      expectedVersion: 'version',
    }),
  );
});
it('409 refreshes comparison and never reports success', async () => {
  mockEditing = exam;
  (updateExamRiskRecommendationDecision as jest.Mock).mockRejectedValue({
    response: { status: 409 },
  });
  render();
  await click('Registrar');
  expect(onSaved).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenCalledWith(
    expect.stringContaining('foi alterada'),
  );
});
it('write failure keeps draft and does not refresh as a success', async () => {
  mockEditing = exam;
  mockReason = 'Manter rascunho';
  (updateExamRiskRecommendationDecision as jest.Mock).mockRejectedValue(
    new Error('Falha de gravação'),
  );
  render();
  await click('Registrar');
  expect(mockSetError).toHaveBeenCalledWith('Falha de gravação');
  expect(mockSetEditing).not.toHaveBeenCalledWith(null);
  expect(onSaved).not.toHaveBeenCalled();
});
it('offers requested suggestions without prohibited wording', () => {
  expect(nonAdoptionReasonSuggestions).toHaveLength(6);
  expect(nonAdoptionReasonSuggestions.join(' ')).not.toContain(
    'Não indicado para a exposição ocupacional avaliada',
  );
});

it('refreshes on a stale GET without submitting a different recommendation', async () => {
  (fetchExamRiskRecommendationDecisions as jest.Mock).mockResolvedValue({
    riskId: 'risk',
    recommendedExams: [
      {
        ...exam,
        recommendationSource: { ruleId: 'other', ruleExamId: 'other' },
      },
    ],
  });
  render();
  await click('Não adotar');
  expect(updateExamRiskRecommendationDecision).not.toHaveBeenCalled();
  expect(onSaved).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenCalledWith(
    expect.stringContaining('foi alterada'),
  );
});
it('reports confirmed save separately from refetch failure', async () => {
  mockEditing = exam;
  onSaved.mockRejectedValueOnce(new Error('refetch failed'));
  render();
  await click('Registrar');
  expect(updateExamRiskRecommendationDecision).toHaveBeenCalledTimes(1);
  expect(onMessage).toHaveBeenCalledWith(
    expect.stringContaining('Decisão registrada, mas'),
  );
});

describe('compact action presentation and optional reason suggestions', () => {
  it('shows a red action and a grey separator only when both pending actions are present', () => {
    expect(render({ showAdoptSeparator: true })).toContain('|');
    expect(mockButtons[0].color).toBe('error');
    expect(mockButtons[0].size).toBe('small');
    expect(mockButtons[0].startIcon.props['aria-hidden']).toBe('true');
    expect(mockButtons[0].startIcon.props.style).toMatchObject({
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    });
    expect(render({ showAdoptSeparator: false })).not.toContain('|');
    expect(
      render({ showAdoptSeparator: true, canUpdate: false }),
    ).not.toContain('|');
  });
  it('uses orange for reconsideration while keeping the blue decision state separate', () => {
    const declined = {
      ...exam,
      isMissing: false,
      adoptionState: 'NOT_ADOPTED',
      nonAdoptionDecision: {
        ...exam.nonAdoptionDecision,
        valid: true,
        active: true,
      },
    };
    const html = render({ exam: declined, showAdoptSeparator: true });
    expect(html).toContain('Não adotado por decisão da empresa');
    expect(html).toContain('Reconsiderar decisão');
    expect(html).not.toContain('|');
    expect(mockButtons[0].color).toBe('warning');
    expect(mockButtons[0].startIcon.props.style.borderRadius).toBe('50%');
  });
  it('starts with empty freely editable input', () => {
    mockEditing = exam;
    render();
    expect(mockAutocompleteProps.inputValue).toBe('');
    expect(mockAutocompleteProps.freeSolo).toBe(true);
    expect(mockSetReason).not.toHaveBeenCalled();
  });
  it.each(
    nonAdoptionReasonSuggestions.filter((value) => value !== 'Outro motivo:'),
  )('fills selected suggestion: %s', (option) => {
    mockEditing = exam;
    render();
    mockAutocompleteProps.onChange(null, option, 'selectOption');
    expect(mockSetReason).toHaveBeenLastCalledWith(option);
  });
  it('fills Outro motivo with trailing space and focuses the cursor at the end', () => {
    mockEditing = exam;
    render();
    const input = { focus: jest.fn(), setSelectionRange: jest.fn() };
    mockTextFieldProps.inputRef.current = input;
    const previous = global.requestAnimationFrame;
    global.requestAnimationFrame = jest.fn((callback) => {
      callback(0);
      return 1;
    });
    try {
      mockAutocompleteProps.onChange(null, 'Outro motivo:', 'selectOption');
      expect(mockSetReason).toHaveBeenLastCalledWith('Outro motivo: ');
      expect(input.focus).toHaveBeenCalledTimes(1);
      expect(input.setSelectionRange).toHaveBeenCalledWith(
        'Outro motivo: '.length,
        'Outro motivo: '.length,
      );
    } finally {
      global.requestAnimationFrame = previous;
    }
  });
  it('allows replacing, complementing and clearing after selection without reset restoring old text', () => {
    mockEditing = exam;
    render();
    mockAutocompleteProps.onChange(null, 'Não informado', 'selectOption');
    expect(mockSetReason).toHaveBeenLastCalledWith('Não informado');
    for (const text of ['Não informado — detalhe', 'Texto substituído', '']) {
      mockAutocompleteProps.onInputChange(null, text, 'input');
      expect(mockSetReason).toHaveBeenLastCalledWith(text);
    }
    const calls = mockSetReason.mock.calls.length;
    mockAutocompleteProps.onInputChange(null, 'Não informado', 'reset');
    expect(mockSetReason).toHaveBeenCalledTimes(calls);
    mockAutocompleteProps.onChange(null, null, 'clear');
    expect(mockSetReason).toHaveBeenLastCalledWith('');
  });
});
