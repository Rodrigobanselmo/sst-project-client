import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { ModalEnum } from 'core/enums/modal.enums';
import { ICompany } from 'core/interfaces/api/ICompany';

import { IUseEditEmployee } from '../../../hooks/useEditEmployee';

export const usePersonalData = ({
  data,
  onSubmitData,
  setData,
  onCloseUnsaved: onClose,
  onStackOpenModal,
  ...rest
}: IUseEditEmployee) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { nextStep, stepCount, goToStep } = useWizard();

  const fields = [
    'cpf',
    'name',
    'sex',
    'nickname',
    'esocialCode',
    'email',
    'phone',
    'socialName',
  ];

  const onCloseUnsaved = async () => {
    onClose(() => reset());
  };

  const lastStep = async () => {
    await onSubmit();
    goToStep(stepCount - 1);
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const {
        name,
        cpf,
        sex,
        nickname,
        esocialCode,
        email,
        phone,
        socialName,
      } = getValues();

      const submitData = {
        ...data,
        name,
        cpf,
        sex,
        nickname,
        esocialCode,
        email,
        phone,
        socialName,
      };

      onSubmitData(submitData, nextStep);
    }
  };

  // const handleOpenCompanySelect = () => {
  //   const onSelect = (companies: ICompany[]) => {
  //     setData({
  //       ...data,
  //       companies,
  //     });
  //   };

  //   onStackOpenModal(ModalEnum.COMPANY_SELECT, {
  //     multiple: true,
  //     onSelect,
  //     selected: data.companies,
  //   } as Partial<typeof initialCompanySelectState>);
  // };

  return {
    onSubmit,
    control,
    onCloseUnsaved,
    lastStep,
    data,
    setData,
    setValue,
    ...rest,
  };
};
