import * as dayjs from 'dayjs';
import type { AppProps } from 'next/app';

import DefaultLayout from '../layouts/default/layout';
import DefaultProviders from '../layouts/default/providers';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

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
