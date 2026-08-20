import { useRouter } from 'next/router';
import { CircularProgress } from '@mui/material';

import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import SFlex from 'components/atoms/SFlex';
import { parseGseEffectiveOriginReturn } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/open-gse-effective-origin.util';
import { GSE_WIZARD_STEP } from 'components/organisms/modals/ModalAddGHO/gse-wizard-steps';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';

import { CharacterizationEditView } from './CharacterizationEditView';

const CharacterizationEditPageContent = () => {
  const router = useRouter();
  const { onStackOpenModal } = useModal();
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
  const gseReturn = parseGseEffectiveOriginReturn({
    query: router.query,
    companyId,
  });

  const onBack = () => {
    if (gseReturn) {
      onStackOpenModal(ModalEnum.GHO_ADD, {
        id: gseReturn.ghoId,
        layout: 'page' as const,
        initialWizardStep: GSE_WIZARD_STEP.RISKS,
      });
      void router.push(gseReturn.href);
      return;
    }
    router.back();
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
