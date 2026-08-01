import { useEffect, useRef } from 'react';
import { useWizard } from 'react-use-wizard';

import { clampCharacterizationWizardStep } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-step.util';

type ApplyCharacterizationWizardStepProps = {
  /** Intenção de navegação (ex.: 4 = Análise IA). */
  requestedStep?: number;
  /** Só navega quando o editor estiver hidratado e o step for válido. */
  enabled: boolean;
};

/**
 * Aplica o step solicitado UMA vez, usando o contexto do Wizard interno.
 * Evita o `active={n}` contínuo do WizardTabs, que em wizard aninhado
 * (company-flow + editor) pode chamar goToStep no wizard externo e
 * desmontar o shell de Elementos Caracterizados (tela branca).
 */
export function ApplyCharacterizationWizardStep({
  requestedStep,
  enabled,
}: ApplyCharacterizationWizardStepProps) {
  const { goToStep, stepCount, activeStep } = useWizard();
  const appliedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof requestedStep !== 'number') return;

    const target = clampCharacterizationWizardStep(requestedStep);
    if (target < 0 || target >= stepCount) return;

    if (appliedRef.current === target && activeStep === target) return;

    if (activeStep !== target) {
      goToStep(target);
    }
    appliedRef.current = target;
  }, [enabled, requestedStep, goToStep, stepCount, activeStep]);

  return null;
}
