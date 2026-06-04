import Head from 'next/head';
import { NextPage } from 'next';
import { SitePage } from '@v2/pages/site/site.page';

const SITE_TITLE = 'SimpleSST — Gestão de SST simples, rastreável e inteligente';
const SITE_DESCRIPTION =
  'Do inventário de riscos ao PGR: conecte dados, documentos, plano de ação e fatores psicossociais em uma plataforma feita para SST.';

const SiteRoutePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
      </Head>
      <SitePage />
    </>
  );
};

export default SiteRoutePage;
