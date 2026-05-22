/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const { onClose, updateMutation, createMutation, data, setData } = props;

  const { getValues, control, setError, reset, setValue, clearErrors } =
    useFormContext();
  const { stepCount, goToStep, nextStep, previousStep } = useWizard();
  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const { handleSelectCompany, getIsSameCompany } = useCompanyTenant();

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
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

    if (error) return;
    if (!data.type) return;

    const classifications = normalizeDocumentModelClassifications(
      data.classifications,
    );
    const classificationConflict = getDocumentModelClassificationConflict(
      classifications,
      data.type,
    );

    if (classificationConflict) {
      setError('type', { message: classificationConflict });
      return;
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
      if (createdData) {
        setData((d) => ({
          ...d,
          id: createdData?.id,
          ...(companyId ? { companyId } : {}),
        }));
        nextStep();
      }
    };

    try {
      if (!data.id) {
        if (!isSameCompany) {
          handleSelectCompany(create, data.companyId);
        } else {
          create();
        }
      } else {
        await updateMutation.mutateAsync({
          name: submitData.name,
          description: submitData.description,
          type: submitData.type,
          ...getDocumentModelMetadataPatch(data),
        });
      }
    } catch (error) {}
  };

  return {
    ...props,
    onSubmit,
    control,
    setValue,
    onCloseUnsaved,
    lastStep,
    previousStep,
  };
};

export type IUseData = ReturnType<typeof useDataStep>;
