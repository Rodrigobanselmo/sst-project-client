import { useState } from 'react';
import { StepWizardChildProps } from 'react-step-wizard';

export const useStepper = () => {
  const [step, updateState] = useState<StepWizardChildProps>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setInstance = (SW: any) => updateState(SW);

  return { setInstance, step };
};
