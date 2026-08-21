/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWizard } from 'react-use-wizard';

import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';

export const useDataStep = (props: IUseDocumentModel) => {
  const { onClose, persistDocumentModel } = props;

  const { stepCount, goToStep, previousStep } = useWizard();
  const onCloseUnsaved = async () => {
    onClose(() => null);
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    await persistDocumentModel();
  };

  return {
    ...props,
    onSubmit,
    onCloseUnsaved,
    lastStep,
    previousStep,
  };
};

export type IUseData = ReturnType<typeof useDataStep>;
