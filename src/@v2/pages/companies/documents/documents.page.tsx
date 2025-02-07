import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { DocumentsContent } from './components/ActionPlanContent/ActionPlanContent';

export const DocumentsPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  return (
    <>
      <SHeaderTag title={'Documentos'} />
      <SContainer>
        <SPageHeader mb={8} title="Documentos" />
        <DocumentsContent companyId={companyId} />
      </SContainer>
    </>
  );
};
