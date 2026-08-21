/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useCompanyTenant } from 'core/hooks/useCompanyTenant';
import { ICreateDocumentModel } from 'core/services/hooks/mutations/manager/document-model/useMutCreateDocumentModel/useMutCreateDocumentModel';

import {
  getDocumentModelClassificationConflict,
  normalizeDocumentModelClassifications,
} from 'project/enum/document-model-classification.enum';

import { getDocumentModelMetadataPatch } from '../../../hooks/useEditDocumentModel';
import { IUseDocumentModel } from '../../../hooks/useEditDocumentModel';

export const useDataStep = (props: IUseDocumentModel) => {
  const {
    onClose,
    closeEditor,
    updateMutation,
    createMutation,
    data,
    setData,
    markPersisted,
  } = props;
  const [saveIntent, setSaveIntent] = useState<'stay' | 'exit' | null>(null);
  const saveIntentRef = useRef<'stay' | 'exit'>('stay');

  const { getValues, control, setError, reset, setValue, clearErrors } =
    useFormContext();
  const { stepCount, goToStep, nextStep, previousStep } = useWizard();
  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const { handleSelectCompany, getIsSameCompany } = useCompanyTenant();

  const persistData = async (): Promise<boolean> => {
    clearErrors();

    const { name, description } = getValues();

    let error = false;
    if (!name) {
      setError('name', { message: 'Campo obrigatório' });
      error = true;
    }
    if (!data.type) {
      setError('type', { message: 'Campo obrigatório' });
      error = true;
    }

    if (error) return false;
    if (!data.type) return false;

    const classifications = normalizeDocumentModelClassifications(
      data.classifications,
    );
    const classificationConflict = getDocumentModelClassificationConflict(
      classifications,
      data.type,
    );

    if (classificationConflict) {
      setError('type', { message: classificationConflict });
      return false;
    }

    const submitData: ICreateDocumentModel = {
      name,
      description,
      companyId: data.companyId,
      ...(data.copyFromId ? { copyFromId: data.copyFromId } : {}),
      type: data.type,
      classifications,
    };

    const isSameCompany = getIsSameCompany(data.companyId);

    const create = async (companyId?: string) => {
      const createdData = await createMutation.mutateAsync({
        ...submitData,
        ...(companyId ? { companyId } : {}),
      });
      if (!createdData) return false;

      setData((d) => ({
        ...d,
        id: createdData?.id,
        name: submitData.name,
        description: submitData.description,
        ...(companyId ? { companyId } : {}),
      }));
      markPersisted({
        name: submitData.name,
        description: submitData.description,
        type: submitData.type,
        classifications: submitData.classifications,
        copyFromId: submitData.copyFromId ?? null,
        status: data.status,
      });

      if (saveIntentRef.current === 'exit') {
        closeEditor();
      } else {
        nextStep();
      }
      return true;
    };

    try {
      if (!data.id) {
        if (!isSameCompany) {
          handleSelectCompany(create, data.companyId);
          return false;
        }
        return await create();
      }

      await updateMutation.mutateAsync({
        name: submitData.name,
        description: submitData.description,
        type: submitData.type,
        ...getDocumentModelMetadataPatch(data),
      });
      setData((d) => ({
        ...d,
        name: submitData.name,
        description: submitData.description,
      }));
      markPersisted({
        name: submitData.name,
        description: submitData.description,
        type: submitData.type,
        status: data.status,
        classifications: submitData.classifications,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const onSubmit = async () => {
    saveIntentRef.current = 'stay';
    setSaveIntent('stay');
    const ok = await persistData();
    setSaveIntent(null);
    return ok;
  };

  const onSubmitAndExit = async () => {
    saveIntentRef.current = 'exit';
    setSaveIntent('exit');
    const ok = await persistData();
    if (ok) {
      closeEditor();
      return;
    }
    setSaveIntent(null);
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const saveBusy = props.isPersisting || saveIntent !== null;

  return {
    ...props,
    onSubmit,
    onSubmitAndExit,
    control,
    setValue,
    onCloseUnsaved,
    lastStep,
    previousStep,
    saveLoading: saveIntent === 'stay',
    saveAndExitLoading: saveIntent === 'exit',
    saveBusy,
  };
};

export type IUseData = ReturnType<typeof useDataStep>;
