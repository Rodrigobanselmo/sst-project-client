import { FC } from 'react';

import Head from 'next/head';

import { SHeaderProps } from './types';

export const SHeader: FC<SHeaderProps> = ({ title }) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
  );
};
