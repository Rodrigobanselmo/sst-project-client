import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { useRouter } from 'next/router';
import { DocumentControlView } from './components/DocumentControlView/DocumentControlView';

export const DocumentViewPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const documentControlId = Number(router.query.id);

  return (
    <>
      <SHeaderTag title={'Documento'} />
      <SContainer>
        <SPageHeader mb={8} title="Documentos" />
        <DocumentControlView
          companyId={companyId}
          documentControlId={documentControlId}
        />
      </SContainer>
    </>
  );
};
