import Head from 'next/head';
import { NextPage } from 'next';
import { SiteGymLaboralPage } from '@v2/pages/site/site-gym-laboral.page';
import { SITE_GYM_LABORAL } from '@v2/pages/site/constants/site-gym-laboral.constant';

const PAGE_TITLE = `${SITE_GYM_LABORAL.title} — SimpleSST`;
const PAGE_DESCRIPTION = SITE_GYM_LABORAL.subtitle;

const SiteGymLaboralRoutePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
      </Head>
      <SiteGymLaboralPage />
    </>
  );
};

export default SiteGymLaboralRoutePage;
