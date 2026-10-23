import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExamRiskPublishLibrary } from './ExamRiskPublishLibrary';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { publishPersistedExamRisk } from '@v2/services/medicine/company-exam-risk-coverage/publish-persisted-exam-risk.service';
let mockButton: any;
jest.mock('components/molecules/SAuthShow', () => ({ useAuthShow: jest.fn() }));
jest.mock(
  '@v2/services/medicine/company-exam-risk-coverage/publish-persisted-exam-risk.service',
  () => ({ publishPersistedExamRisk: jest.fn() }),
);
jest.mock('@mui/material', () => ({
  Button: (p: any) => {
    mockButton = p;
    return React.createElement('button', null, p.children);
  },
  Typography: ({ children }: any) =>
    React.createElement('span', null, children),
}));
const onSaved = jest.fn();
const render = (overrides = {}) =>
  renderToStaticMarkup(
    React.createElement(ExamRiskPublishLibrary, {
      companyId: 'company',
      workspaceId: 'workspace',
      linkId: 574,
      onSaved,
      ...overrides,
    }),
  );
beforeEach(() => {
  jest.clearAllMocks();
  (useAuthShow as jest.Mock).mockReturnValue({ isMasterAdmin: true });
  (global as any).window = { confirm: jest.fn(() => true) };
  onSaved.mockResolvedValue(undefined);
});
afterEach(() => {
  delete (global as any).window;
});
it('offers publication only to MASTER with link and establishment', () => {
  expect(render()).toContain('+ Publicar na Biblioteca');
  expect(render({ linkId: undefined })).toBe('');
  expect(render({ workspaceId: undefined })).toBe('');
  (useAuthShow as jest.Mock).mockReturnValue({ isMasterAdmin: false });
  expect(render()).toBe('');
});
it('does nothing when confirmation is cancelled', () => {
  window.confirm = jest.fn(() => false);
  render();
  mockButton.onClick();
  expect(publishPersistedExamRisk).not.toHaveBeenCalled();
});
it.each(['created', 'alreadyExists', 'skipped'])(
  'sends only identifiers and refreshes after %s, preventing duplicate clicks',
  async (action) => {
    (publishPersistedExamRisk as jest.Mock).mockResolvedValue({
      action,
      reason: 'motivo',
    });
    render();
    mockButton.onClick();
    mockButton.onClick();
    await new Promise((resolve) => setImmediate(resolve));
    expect(publishPersistedExamRisk).toHaveBeenCalledTimes(1);
    expect(publishPersistedExamRisk).toHaveBeenCalledWith({
      companyId: 'company',
      workspaceId: 'workspace',
      linkId: 574,
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
  },
);
it('does not report or refresh success on failure and allows retry', async () => {
  (publishPersistedExamRisk as jest.Mock).mockRejectedValue(
    new Error('failed'),
  );
  render();
  mockButton.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  expect(onSaved).not.toHaveBeenCalled();
  mockButton.onClick();
  await new Promise((resolve) => setImmediate(resolve));
  expect(publishPersistedExamRisk).toHaveBeenCalledTimes(2);
});
