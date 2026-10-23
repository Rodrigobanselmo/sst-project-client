import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskDivergenceAction } from './ExamRiskDivergenceAction';
import type { ExamRiskParameterReview } from '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.types';
const review = {
  group: 'age',
  state: 'UNREVIEWED',
  canReview: true,
  canReopen: false,
} as ExamRiskParameterReview;
const props = {
  review,
  canUpdate: true,
  pending: false,
  label: 'Faixa etária, vínculo 283',
  onAction: jest.fn(),
};
const html = (changes = {}) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskDivergenceAction, { ...props, ...changes }),
  );

describe('discrete company divergence action', () => {
  it('renders acceptance beside a divergent value with an accessible identity label', () => {
    expect(html()).toContain('Aceitar divergência');
    expect(html()).toContain('vínculo 283');
  });
  it('shows reopening only when allowed on an accepted comparison', () => {
    const output = html({
      review: { ...review, state: 'ACCEPTED', canReopen: true },
    });
    expect(output).toContain('Reabrir avaliação');
    expect(output).not.toContain('Aceitar divergência');
  });
  it.each([
    { canUpdate: false },
    { review: undefined },
    { review: { ...review, canReview: false } },
    { review: { ...review, state: 'EQUIVALENT' } },
    { review: { ...review, state: 'UNAVAILABLE' } },
    { review: { ...review, state: 'ACCEPTED', canReopen: false } },
  ])(
    'does not expose controls without permission/safe divergence: %j',
    (changes) => {
      expect(html(changes)).toBe('');
    },
  );
  it('disables the action during save', () => {
    expect(html({ pending: true })).toContain('disabled');
  });
  it.each(['UNREVIEWED', 'ACCEPTED'] as const)(
    'dispatches the independent decision and stops row expansion (%s)',
    (state) => {
      const onAction = jest.fn(),
        stopPropagation = jest.fn();
      const element = ExamRiskDivergenceAction({
        ...props,
        onAction,
        review: { ...review, state, canReopen: true },
      })!;
      const button = element.props.children.props.children;
      button.props.onClick({ stopPropagation });
      expect(onAction).toHaveBeenCalledWith(
        state === 'ACCEPTED' ? 'REOPEN' : 'ACCEPT',
      );
      expect(stopPropagation).toHaveBeenCalledTimes(1);
    },
  );
});
