import 'dayjs/locale/pt-br';

import * as dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { AppProps } from 'next/app';
import '../core/styles/react-datepicker.css';
import '../core/styles/react-draft-wysiwyg.css';

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
      </DefaultLayout>
    </DefaultProviders>
  );
}

export default MyApp;
