import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { useRouter } from 'next/router';

import { RoutesEnum } from 'core/enums/routes.enums';
import { ActivityDto } from 'core/interfaces/api/ICompany';
import { useMutCreateCompany } from 'core/services/hooks/mutations/manager/useMutCreateCompany';

import { IUseAddCompany } from '../../../hooks/useEditCompany';

export const useCompanyEdit = ({
  companyData,
  setCompanyData,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset } = useFormContext();
  const { nextStep, previousStep, goToStep, stepCount } = useWizard();

  const createCompany = useMutCreateCompany();

  const fields = ['cnae_code', 'cnae_name'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved(() => reset());
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { cnae_name, cnae_code } = getValues();

      const submitData = {
        ...companyData,
        primary_activity: [
          {
            name: cnae_name,
            code: cnae_code,
          },
        ] as ActivityDto[],
        // riskDegree,
      };

      if (companyData.id == '') {
        await createCompany
          .mutateAsync(submitData)
          .then((company) => {
            setCompanyData((companyData) => ({
              ...companyData,
              ...submitData,
              ...company,
            }));
          })
          .catch(() => {});
      } else {
        nextStep();
        setCompanyData((companyData) => ({
          ...companyData,
          ...submitData,
        }));
      }
    }
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  return {
    onSubmit,
    loading: createCompany.isLoading,
    control,
    previousStep,
    onCloseUnsaved,
    lastStep,
    companyData,
  };
};
