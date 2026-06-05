import Head from 'next/head';
import { NextPage } from 'next';
import { SiteArticleCopsoqPage } from '@v2/pages/site/site-article-copsoq.page';
import { SITE_ARTICLE_COPSOQ } from '@v2/pages/site/constants/site-article-copsoq.constant';

const PAGE_TITLE = `${SITE_ARTICLE_COPSOQ.title} — SimpleSST`;
const PAGE_DESCRIPTION = SITE_ARTICLE_COPSOQ.subtitle;

const SiteArticleCopsoqRoutePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
      </Head>
      <SiteArticleCopsoqPage />
    </>
  );
};

export default SiteArticleCopsoqRoutePage;
