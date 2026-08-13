import { useEffect, useRef } from 'react';
import { useWizard } from 'react-use-wizard';

import { decideApplyInitialWizardStep } from './apply-initial-wizard-step.util';

type ApplyCharacterizationWizardStepProps = {
  /** Intenção de abertura (ex.: Análise de Riscos IA). Aplicada uma única vez. */
  requestedStep?: number;
  /** Só navega quando o editor estiver hidratado e o step for válido. */
  enabled: boolean;
};

/**
 * Aplica o step solicitado UMA vez por montagem do wizard interno.
 *
 * Não reagir a mudanças de `activeStep` após a aplicação — isso prendia a aba
 * inicial (usuário clicava em outra aba e o efeito chamava goToStep de novo).
 *
 * Evita também o `active={n}` contínuo do WizardTabs no editor aninhado.
 */
export function ApplyCharacterizationWizardStep({
  requestedStep,
  enabled,
}: ApplyCharacterizationWizardStepProps) {
  const { goToStep, stepCount, activeStep } = useWizard();
  const appliedRef = useRef(false);

  useEffect(() => {
    const decision = decideApplyInitialWizardStep({
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
