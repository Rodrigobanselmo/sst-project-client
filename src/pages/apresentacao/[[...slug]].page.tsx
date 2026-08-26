import Head from 'next/head';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PresentationPage } from '@v2/pages/site/presentation/presentation.page';
import { resolvePresentationCard } from '@v2/pages/site/presentation/constants/presentation.constant';

const DESCRIPTION =
  'Do inventário de riscos ao PGR: conecte dados, documentos, plano de ação e fatores psicossociais em uma plataforma feita para SST.';

const PresentationRoutePage: NextPage = () => {
  const router = useRouter();
  const card = resolvePresentationCard(router.query.slug);
  const title =
    card.slug === 'capa'
      ? 'SimpleSST — Apresentação comercial'
      : `SimpleSST — ${card.id} ${card.title}`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={DESCRIPTION} />
      </Head>
      <PresentationPage />
    </>
  );
};

export default PresentationRoutePage;
