import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ExamRiskAiModeNotice,
  examRiskAiModeCopy,
} from './ExamRiskAiModePresentation';

it.each([false, true])(
  'presents the correct mode without implying automatic changes (review=%s)',
  (isReviewMode) => {
    const element = ExamRiskAiModeNotice({ isReviewMode });
    expect(element.props.severity).toBe(isReviewMode ? 'warning' : 'info');
    const html = renderToStaticMarkup(
      React.createElement(ExamRiskAiModeNotice, { isReviewMode }),
    );
    const copy = examRiskAiModeCopy(isReviewMode);
    expect(html).toContain(copy.notice);
    expect(html).toContain(copy.description);
    if (isReviewMode)
      expect(html).toContain(
        'Os pareceres sobre os vínculos existentes são informativos',
      );
  },
);
