import '../core/styles/react-datepicker.css';
import '../core/styles/react-draft-wysiwyg.css';
import 'dayjs/locale/pt-br';
import { Analytics } from '@vercel/analytics/react';
import * as dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { AppProps } from 'next/app';

import DefaultLayout from '../layouts/default/layout';
import DefaultProviders from '../layouts/default/providers';

dayjs.locale('pt-br');
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DefaultProviders>
      <DefaultLayout>
        <Component {...pageProps} />
        <Analytics />
      </DefaultLayout>
    </DefaultProviders>
  );
}

export default MyApp;
