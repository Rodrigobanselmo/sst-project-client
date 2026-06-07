import Head from 'next/head';
import { NextPage } from 'next';
import { SiteErgonomicsEbookPage } from '@v2/pages/site/site-ergonomics-ebook.page';
import { SITE_ERGONOMICS_EBOOK } from '@v2/pages/site/constants/site-ergonomics-ebook.constant';

const SiteErgonomicsEbookRoutePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{SITE_ERGONOMICS_EBOOK.seoTitle}</title>
        <meta name="description" content={SITE_ERGONOMICS_EBOOK.seoDescription} />
      </Head>
      <SiteErgonomicsEbookPage />
    </>
  );
};

export default SiteErgonomicsEbookRoutePage;
