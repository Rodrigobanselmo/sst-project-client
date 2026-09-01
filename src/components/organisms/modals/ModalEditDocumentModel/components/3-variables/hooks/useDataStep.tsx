/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWizard } from 'react-use-wizard';

import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';

export const useDataStep = (props: IUseDocumentModel) => {
  const { onClose, saveDocumentModel, documentDirty } = props;

  const { stepCount, goToStep, previousStep } = useWizard();
  const onCloseUnsaved = async () => {
    onClose(() => null);
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    if (!documentDirty) return true;
    return saveDocumentModel({ exitAfterSuccess: false });
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
