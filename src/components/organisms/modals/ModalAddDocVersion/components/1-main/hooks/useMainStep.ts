import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import clone from 'clone';
import deepEqual from 'deep-equal';
import { useSnackbar } from 'notistack';

import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  IUpsertPGRDocumentData,
  useMutUpsertPGRDocumentData,
} from 'core/services/hooks/mutations/checklist/documentData/useMutUpsertPGRDocumentData/useMutUpsertPGRDocumentData';
import { dateFormat } from 'core/utils/date/date-format';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { IUsePGRHandleModal } from '../../../hooks/usePGRHandleActions';

export const useMainStep = ({
  data,
  setData,
  initialDataRef,
  ...rest
}: IUsePGRHandleModal) => {
  const { trigger, getValues, setValue, control, setError, reset } =
    useFormContext();
  const { enqueueSnackbar } = useSnackbar();
  const { goToStep, stepCount } = useWizard();

  const updateMutation = useMutUpsertPGRDocumentData();

  const fields = [
    'name',
    'approvedBy',
    'elaboratedBy',
    'revisionBy',
    'coordinatorBy',
    'validityStart',
    'validityEnd',
  ];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved();
    reset();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);
    if (isValid) {
      const {
        name,
        approvedBy,
        elaboratedBy,
        revisionBy,
        coordinatorBy,
        validityStart,
        validityEnd,
      } = getValues();

      const dateStart = validityStart.split('/');
      const dateEnd = validityEnd.split('/');

      if (Number(dateStart[1]) > Number(dateEnd[1])) {
        return enqueueSnackbar('Data de fim deve ser antes da data de início', {
          variant: 'error',
        });
      }

      if (
        Number(dateStart[1]) == Number(dateEnd[1]) &&
        Number(dateStart[0]) >= Number(dateEnd[0])
      ) {
        return enqueueSnackbar('Data de fim deve ser antes da data de início', {
          variant: 'error',
        });
      }

      if (!data.modelId)
        return setError('model', { message: 'Campo obrigatório' });

      const submitData: IUpsertPGRDocumentData = {
        id: data.id,
        companyId: data.companyId,
        workspaceId: data.workspaceId,
        name,
        modelId: data.modelId,

        validityStart: dateFormat(`01/${validityStart}`),
        validityEnd: dateFormat(`01/${validityEnd}`),
        professionals: data.professionals,

        approvedBy,
        elaboratedBy,
        revisionBy,
        coordinatorBy,
      };

      const before = cleanObjectValues(initialDataRef.current);
      const after = { ...data, ...submitData };

      if (!deepEqual(after, before)) {
        await updateMutation
          .mutateAsync(submitData)
          .then(() => {
            setData((data) => {
              const setDataObj = {
                ...data,
                validityStart: dateFormat(`01/${validityStart}`) || null,
                validityEnd: dateFormat(`01/${validityEnd}`) || null,
              };
              initialDataRef.current = setDataObj;

              return setDataObj;
            });
            goToStep(stepCount);
          })
          .catch(() => {});
        setData((data) => ({ ...data, ...submitData } as any));
      }
      goToStep(stepCount - 1);
    }
  };

  const onAddArray = (professional: IProfessional, type: 'professionals') => {
    let value: any;

    if (Array.isArray(professional)) {
      value = professional.map((p) => ({
        ...p,
        professionalDocumentDataSignature: {
          professionalId: p.id,
          isSigner: true,
          isElaborator: true,
        },
      }));
    } else {
      value = {
        ...professional,
        professionalDocumentDataSignature: {
          ...(professional?.professionalDocumentDataSignature || {}),
          professionalId: professional.id,
          isSigner: true,
          isElaborator: true,
        },
      } as IProfessional;
    }

    setData({
      ...data,
      [type]: removeDuplicate([...(data as any)[type], ...value], {
        removeById: 'id',
      }),
    });
  };

  const onDeleteArray = (value: IProfessional, type: 'professionals') => {
    setData({
      ...data,
      [type]: [
        ...(data as any)[type].filter(
          (item: IProfessional) => item.id !== value.id,
        ),
      ],
    });
  };

  const onAddSigner = (
    professional: IProfessional,
    check: boolean,
    type: 'professionals',
  ) => {
    const dataCopy = clone(data);

    const value = {
      ...professional,
      professionalDocumentDataSignature: {
        ...(professional?.professionalDocumentDataSignature || {}),
        professionalId: professional.id,
        isSigner: check,
      },
    } as IProfessional;

    const index = dataCopy[type]?.findIndex((item) => item.id === value.id);
    if (index != -1) {
      dataCopy[type][index] = value;
    }

    setData({
      ...dataCopy,
    });
  };

  const onAddElaborator = (
    professional: IProfessional,
    check: boolean,
    type: 'professionals',
  ) => {
    const dataCopy = clone(data);

    const value = {
      ...professional,
      professionalDocumentDataSignature: {
        ...(professional?.professionalDocumentDataSignature || {}),
        professionalId: professional.id,
        isElaborator: check,
      },
    } as IProfessional;

    const index = dataCopy[type]?.findIndex((item) => item.id === value.id);
    if (index != -1) {
      dataCopy[type][index] = value;
    }

    setData({
      ...dataCopy,
    });
  };

  return {
    onSubmit,
    loading: updateMutation.isLoading,
    control,
    onCloseUnsaved,
    onAddArray,
    onDeleteArray,
    onAddSigner,
    onAddElaborator,
    data,
    setData,
    initialDataRef,
    setValue,
  };
};

export type IUseMainStep = ReturnType<typeof useMainStep>;
