import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useMutAddCompanyPhoto } from 'core/services/hooks/mutations/manager/company/useMutAddCompanyPhoto';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';

import { IUseAddCompany } from '../../../hooks/useEditCompany';

export const useCompanyEdit = ({
  companyData,
  setCompanyData,
  onSubmitData,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { previousStep, nextStep } = useWizard();
  const { onStackOpenModal } = useModal();
  const addPhotoMutation = useMutAddCompanyPhoto();

  const updateCompany = useMutUpdateCompany();

  const fields = ['description', 'operationTime'];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved(() => reset());
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { description, operationTime } = getValues();

      const submitData = {
        ...companyData,
        description,
        operationTime,
        companyId: companyData.id,
      };

      onSubmitData(submitData, nextStep);
    }
  };

  const handleAddPhoto = () => {
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name: 'Logo da empresa',
      freeAspect: true,
      imageExtension: 'png',
      accept: ['image/*', '.heic'],
      onConfirm: async (photo) => {
        const addLocalPhoto = (src: string) => {
          setCompanyData((oldData) => ({
            ...oldData,
            logoUrl: src,
          }));
        };

        if (photo.file) {
          const company = await addPhotoMutation
            .mutateAsync({ file: photo.file, companyId: companyData.id })
            .catch(() => {});

          if (company?.logoUrl) addLocalPhoto(company.logoUrl);
        }
      },
    } as Partial<typeof initialPhotoState>);
  };

  return {
    onSubmit,
    loading: updateCompany.isLoading,
    control,
    previousStep,
    onCloseUnsaved,
    setValue,
    handleAddPhoto,
  };
};
