import type { AppProps } from 'next/app';

import DefaultLayout from '../layouts/default/layout';
import DefaultProviders from '../layouts/default/providers';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DefaultProviders>
      <DefaultLayout>
        <Component {...pageProps} />
      </DefaultLayout>
    </DefaultProviders>
  );
}

export default MyApp;
