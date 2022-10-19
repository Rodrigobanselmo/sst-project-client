import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import clone from 'clone';
import deepEqual from 'deep-equal';
import { useSnackbar } from 'notistack';

import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  IUpsertDocumentPCMSO,
  useMutUpsertDocumentPCMSO,
} from 'core/services/hooks/mutations/checklist/docPCMSO/useMutUpsertDocPCMSO';
import { dateFormat } from 'core/utils/date/date-format';
import { cleanObjectValues } from 'core/utils/helpers/cleanObjectValues';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { IUseAddCompany } from '../../../hooks/useHandleActions';

export const useStep = ({ data, setData, initialDataRef }: IUseAddCompany) => {
  const { trigger, getValues, control } = useFormContext();
  const { nextStep, previousStep } = useWizard();
  const { enqueueSnackbar } = useSnackbar();

  const updateMutation = useMutUpsertDocumentPCMSO();

  const fields = ['validityStart', 'validityEnd'];

  const onPrevStep = async () => {
    previousStep();
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { validityStart, validityEnd } = getValues();

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

      const submitData: IUpsertDocumentPCMSO = {
        validityStart: dateFormat(`01/${validityStart}`),
        validityEnd: dateFormat(`01/${validityEnd}`),
        professionals: data.professionals,
        // users: data.users,
        id: data.id,
      };

      if (data.id) {
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
              nextStep();
            })
            .catch(() => {});
        } else {
          nextStep();
        }
      }
    }
  };

  const onAddArray = (
    professional: IProfessional,
    type: 'professionals' | 'users',
  ) => {
    let value: any;

    if (Array.isArray(professional)) {
      value = professional.map((p) => ({
        ...p,
        professionalPgrSignature: {
          professionalId: p.id,
          isSigner: true,
          isElaborator: true,
        },
      }));
    } else {
      value = {
        ...professional,
        professionalPgrSignature: {
          ...(professional?.professionalPgrSignature || {}),
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

  const onDeleteArray = (
    value: IProfessional,
    type: 'professionals' | 'users',
  ) => {
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
    type: 'professionals' | 'users',
  ) => {
    const dataCopy = clone(data);

    const value = {
      ...professional,
      professionalPgrSignature: {
        ...(professional?.professionalPgrSignature || {}),
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
    type: 'professionals' | 'users',
  ) => {
    const dataCopy = clone(data);

    const value = {
      ...professional,
      professionalPgrSignature: {
        ...(professional?.professionalPgrSignature || {}),
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
    onPrevStep,
    onAddArray,
    onDeleteArray,
    onAddSigner,
    onAddElaborator,
  };
};
