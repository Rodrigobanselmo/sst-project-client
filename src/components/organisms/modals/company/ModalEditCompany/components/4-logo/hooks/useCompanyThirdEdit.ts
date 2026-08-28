import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useMutAddCompanyPhoto } from 'core/services/hooks/mutations/manager/company/useMutAddCompanyPhoto';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';
import { stripFrpsPrivacyFromCompanyMetadata } from 'core/utils/company/strip-frps-privacy-from-metadata';

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

  const fields = [
    'description',
    'operationTime',
    'metadata.shortName',
    'metadata.primaryColor',
    'metadata.visualIdentityEnabled',
    'metadata.customLogoUrl',
    'metadata.logoLightUrl',
    'metadata.logoDarkUrl',
    'metadata.sidebarBackgroundColor',
    'metadata.interfaceTheme',
  ];

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved(() => reset());
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { description, operationTime, metadata } = getValues();

      // Merge metadata do formulário com metadata do companyData (visualIdentity etc.).
      // Nunca reenviar frpsPrivacy — só o endpoint dedicado altera essa chave.
      const mergedMetadata = stripFrpsPrivacyFromCompanyMetadata({
        ...companyData.metadata,
        ...metadata,
      });

      const submitData = {
        ...companyData,
        description,
        operationTime,
        metadata: mergedMetadata,
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
      saveAsIs: true,
      accept: ['image/png', 'image/*', '.heic'],
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

  const handleAddMetadataLogo = (
    key: 'customLogoUrl' | 'logoLightUrl' | 'logoDarkUrl',
    name: string,
  ) => {
    onStackOpenModal(ModalEnum.UPLOAD_PHOTO, {
      name,
      freeAspect: true,
      imageExtension: 'png',
      saveAsIs: true,
      accept: ['image/png'],
      onConfirm: async (photo) => {
        const addLocalPhoto = (src: string) => {
          setCompanyData((oldData) => ({
            ...oldData,
            metadata: {
              ...oldData.metadata,
              [key]: src,
            },
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

  const handleAddCustomLogo = () =>
    handleAddMetadataLogo('customLogoUrl', 'Logo padrão da interface');
  const handleAddLightLogo = () =>
    handleAddMetadataLogo('logoLightUrl', 'Logo para modo Claro');
  const handleAddDarkLogo = () =>
    handleAddMetadataLogo('logoDarkUrl', 'Logo para modo Escuro');

  const handleRemovePhoto = async () => {
    await updateCompany
      .mutateAsync({ logoUrl: '', id: companyData.id })
      .catch(() => {});

    setCompanyData((oldData) => ({
      ...oldData,
      logoUrl: '',
    }));
  };

  const handleRemoveMetadataLogo = (
    key: 'customLogoUrl' | 'logoLightUrl' | 'logoDarkUrl',
  ) => {
    setCompanyData((oldData) => ({
      ...oldData,
      metadata: {
        ...oldData.metadata,
        [key]: '',
      },
    }));
  };

  const handleRemoveCustomLogo = () => handleRemoveMetadataLogo('customLogoUrl');
  const handleRemoveLightLogo = () => handleRemoveMetadataLogo('logoLightUrl');
  const handleRemoveDarkLogo = () => handleRemoveMetadataLogo('logoDarkUrl');

  return {
    onSubmit,
    loading: updateCompany.isLoading,
    control,
    previousStep,
    onCloseUnsaved,
    setValue,
    handleAddPhoto,
    handleAddCustomLogo,
    handleAddLightLogo,
    handleAddDarkLogo,
    handleRemovePhoto,
    handleRemoveCustomLogo,
    handleRemoveLightLogo,
    handleRemoveDarkLogo,
  };
};
