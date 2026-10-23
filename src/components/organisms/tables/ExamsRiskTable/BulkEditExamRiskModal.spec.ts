import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BulkEditExamRiskModal } from './BulkEditExamRiskModal';
const mockButtons: any[] = [];
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
                return React.createElement('div', null, props.children);
              },
      },
    ),
);
it('sends only marked groups, preserving false, zero and explicit clearing', () => {
  const onConfirm = jest.fn();
  const values = [
    false,
    {},
    true,
    'female',
    true,
    '',
    '',
    true,
    '0',
    false,
    '',
    false,
    '3',
    false,
    '3',
  ];
  let index = 0;
  const spy = jest
    .spyOn(React, 'useState')
    .mockImplementation(
      (initial: any) =>
        [index < values.length ? values[index++] : initial, jest.fn()] as any,
    );
  try {
    renderToStaticMarkup(
      React.createElement(BulkEditExamRiskModal, {
        open: true,
        count: 2,
        canEditQuantitative: false,
        isSaving: false,
        onClose: jest.fn(),
        onConfirm,
      }),
    );
    const apply = mockButtons.find(
      (button) => button.children === 'Aplicar alterações',
    );
    expect(apply.disabled).toBe(false);
    apply.onClick();
    expect(onConfirm).toHaveBeenCalledWith({
      isMale: false,
      isFemale: true,
      fromAge: null,
      toAge: null,
      validityInMonths: 0,
    });
  } finally {
    spy.mockRestore();
  }
});
