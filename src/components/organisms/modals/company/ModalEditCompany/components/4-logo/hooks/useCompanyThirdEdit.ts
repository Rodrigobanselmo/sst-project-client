import { useFormContext } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

import { initialPhotoState } from 'components/organisms/modals/ModalUploadPhoto';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useMutAddCompanyPhoto } from 'core/services/hooks/mutations/manager/company/useMutAddCompanyPhoto';
import { useMutUpdateCompany } from 'core/services/hooks/mutations/manager/company/useMutUpdateCompany';
import { stripFrpsPrivacyFromCompanyMetadata } from 'core/utils/company/strip-frps-privacy-from-metadata';

import { IUseAddCompany } from '../../../hooks/useEditCompany';
import {
  INSTITUTIONAL_PRESET_OVERWRITE_MESSAGE,
  resolveInstitutionalPresetApplication,
} from '../../../company-institutional-preset';

export const useCompanyEdit = ({
  companyData,
  setCompanyData,
  onSubmitData,
  ...rest
}: IUseAddCompany) => {
  const { trigger, getValues, control, reset, setValue } = useFormContext();
  const { previousStep, nextStep } = useWizard();
  const { onStackOpenModal } = useModal();
  const { preventWarn } = usePreventAction();
  const addPhotoMutation = useMutAddCompanyPhoto();

  const updateCompany = useMutUpdateCompany();

  const fields = [
    'description',
    'operationTime',
    'mission',
    'vision',
    'values',
    'metadata.shortName',
    'metadata.primaryColor',
    'metadata.visualIdentityEnabled',
    'metadata.customLogoUrl',
    'metadata.logoLightUrl',
    'metadata.logoDarkUrl',
    'metadata.sidebarBackgroundColor',
    'metadata.interfaceTheme',
  ];

  const applyPresetToForm = (preset: {
    mission: string;
    vision: string;
    values: string;
  }) => {
    setValue('mission', preset.mission, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('vision', preset.vision, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue('values', preset.values, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleApplyInstitutionalPreset = () => {
    const current = {
      mission: getValues('mission'),
      vision: getValues('vision'),
      values: getValues('values'),
    };

    const resolved = resolveInstitutionalPresetApplication({
      current,
      confirmedOverwrite: false,
    });

    if (resolved === 'needs-confirmation') {
      preventWarn(INSTITUTIONAL_PRESET_OVERWRITE_MESSAGE, () => {
        const confirmed = resolveInstitutionalPresetApplication({
          current,
          confirmedOverwrite: true,
        });
        if (confirmed !== 'needs-confirmation') {
          applyPresetToForm(confirmed);
        }
      });
      return;
    }

    applyPresetToForm(resolved);
  };

  const onCloseUnsaved = async () => {
    rest.onCloseUnsaved(() => reset());
  };

  const onSubmit = async () => {
    const isValid = await trigger(fields);

    if (isValid) {
      const { description, operationTime, mission, vision, values, metadata } =
        getValues();

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
        mission: mission ?? '',
        vision: vision ?? '',
        values: values ?? '',
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
    handleApplyInstitutionalPreset,
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
