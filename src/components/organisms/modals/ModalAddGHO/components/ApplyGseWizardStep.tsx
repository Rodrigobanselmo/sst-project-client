import { useEffect, useRef } from 'react';
import { useWizard } from 'react-use-wizard';

import { decideApplyGseWizardStep } from '../gse-wizard-steps';

type ApplyGseWizardStepProps = {
  requestedStep?: number;
  enabled: boolean;
};

/** Aplica o step inicial do GSE uma única vez no wizard interno. */
export function ApplyGseWizardStep({
  requestedStep,
  enabled,
}: ApplyGseWizardStepProps) {
  const { goToStep, stepCount, activeStep } = useWizard();
  const appliedRef = useRef(false);

  useEffect(() => {
    const decision = decideApplyGseWizardStep({
      enabled,
      alreadyApplied: appliedRef.current,
      requestedStep,
      activeStep,
      stepCount,
    });

    if (decision.shouldGoToStep && typeof decision.target === 'number') {
      goToStep(decision.target);
    }

    if (decision.markApplied) {
      appliedRef.current = true;
    }
  }, [enabled, requestedStep, goToStep, stepCount, activeStep]);

  return null;
}
