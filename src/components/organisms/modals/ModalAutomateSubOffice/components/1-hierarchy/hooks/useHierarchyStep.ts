import { useWizard } from 'react-use-wizard';

import { IUseAutomateSubOffice } from '../../../hooks/useHandleActions';

export const useHierarchyStep = ({ ...rest }: IUseAutomateSubOffice) => {
  const { nextStep } = useWizard();

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
  };

  const onSubmit = async () => {
    nextStep();
  };

  return {
    onSubmit,
    onCloseUnsaved,
  };
};
