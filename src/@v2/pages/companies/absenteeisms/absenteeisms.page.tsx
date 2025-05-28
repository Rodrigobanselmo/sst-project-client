import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { AbsenteeismContent } from './components/AbsenteeismContent/AbsenteeismContent';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';

export const AbsenteeismsPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeader title={'Absenteísmo'} />
      <SContainer>
        <SPageHeader mb={8} title="Absenteísmo" />
        <AbsenteeismContent companyId={companyId} />
      </SContainer>
    </>
  );
};
