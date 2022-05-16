import { useWizard as useReactWizard } from 'react-use-wizard';

export const useWizard = () => {
  const wizardUtils = useReactWizard();

  return {
    ...wizardUtils,
  };
};
