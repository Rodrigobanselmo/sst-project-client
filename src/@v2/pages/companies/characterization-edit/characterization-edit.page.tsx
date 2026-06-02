import { useRouter } from 'next/router';

import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';

import { CharacterizationEditView } from './CharacterizationEditView';

const CharacterizationEditPageContent = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const workspaceId = router.query.workspaceId as string;
  const characterizationId = router.query.characterizationId as string;

  const onBack = () => {
    router.push(`/dashboard/empresas/${companyId}/${workspaceId}/todos`);
  };

  return (
    <CharacterizationEditView
      companyId={companyId}
      workspaceId={workspaceId}
      characterizationId={characterizationId}
      onBack={onBack}
    />
  );
};

export const CharacterizationEditPage = () => {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <>
        <SHeader title={'Caracterização'} />
        <SContainer />
      </>
    );
  }

  return <CharacterizationEditPageContent />;
};
