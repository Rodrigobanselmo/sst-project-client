/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { render } from '@testing-library/react';

import * as ModalContext from './ModalContext';

const ChildrenSetup: FC = () => {
  const modal = ModalContext.useModal();
  return <p>{JSON.stringify(Object.keys(modal))}</p>;
};

describe('ModalContext', () => {
  it('i should return context value', () => {
    const { asFragment } = render(
      <ModalContext.ModalProvider>
        <ChildrenSetup />
      </ModalContext.ModalProvider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('i should return same context value for multiple children', () => {
    const { asFragment } = render(
      <ModalContext.ModalProvider>
        <ChildrenSetup />
        <ChildrenSetup />
      </ModalContext.ModalProvider>,
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
