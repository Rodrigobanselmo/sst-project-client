import { useRouter } from 'next/router';
import { CircularProgress } from '@mui/material';

import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import SFlex from 'components/atoms/SFlex';

import { CharacterizationEditView } from './CharacterizationEditView';

const CharacterizationEditPageContent = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const workspaceId = router.query.workspaceId as string;
  const characterizationId = router.query.characterizationId as string;
  const wizardStepRaw = router.query.wizardStep;
  const initialWizardStep =
    typeof wizardStepRaw === 'string' && wizardStepRaw !== ''
      ? Number(wizardStepRaw)
      : undefined;
  const aiActionRaw = router.query.aiAction;
  const initialAiAction =
    aiActionRaw === 'assist' || aiActionRaw === 'inventory-summary'
      ? aiActionRaw
      : undefined;

  const onBack = () => {
    router.push(`/dashboard/empresas/${companyId}/${workspaceId}/todos`);
  };

  return (
    <CharacterizationEditView
      companyId={companyId}
      workspaceId={workspaceId}
      characterizationId={characterizationId}
      onBack={onBack}
      initialWizardStep={
        Number.isFinite(initialWizardStep) ? initialWizardStep : undefined
      }
      initialAiAction={initialAiAction}
    />
  );
};

export const CharacterizationEditPage = () => {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <>
        <SHeader title={'Caracterização'} />
        <SContainer>
          <SFlex align="center" justify="center" sx={{ minHeight: 200, py: 8 }}>
            <CircularProgress size={32} />
          </SFlex>
        </SContainer>
      </>
    );
  }

  return <CharacterizationEditPageContent />;
};
