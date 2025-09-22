import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { InputFormModelSelectForm } from '../inputs/InputFormModelSelect/InputFormModelSelectForm';
import { InputWorkspaceSelectMultipleForm } from '../inputs/InputWorkspaceSelect/InputWorkspaceSelectMultipleForm';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitchForm } from '@v2/components/forms/controlled/SSwitchForm/SSwitchForm';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SRadioForm } from '@v2/components/forms/controlled/SRadioForm/SRadioForm';
import { useFormContext, useWatch } from 'react-hook-form';
import { IFormApplicationFormFields } from '../../../schema/form-application.schema';
import { useEffect } from 'react';

type Props = {
  companyId: string;
  disabled?: boolean;
};

export const FormFormApplication = ({ companyId, disabled }: Props) => {
  const form = useFormContext<IFormApplicationFormFields>();

  const formModel = useWatch({
    name: 'form',
    control: form.control,
  });

  return (
    <>
      <SInputForm
        label="Nome para identificação"
        labelShrink="Nome"
        placeholder="nome para identificação"
        fullWidth
        name="name"
      />
      <InputFormModelSelectForm
        companyId={companyId}
        name="form"
        disabled={disabled}
        onSelectValue={(value) => {
          if (!value) return;

          form.setValue(
            'shareableLink',
            formModel.shareableLink
              ? { value: 'true', label: 'Link único compartilhável' }
              : { value: 'false', label: 'Link por funcionário' },
          );
          form.setValue('anonymous', formModel.anonymous);
        }}
      />
      <InputWorkspaceSelectMultipleForm
        companyId={companyId}
        name="workspaceIds"
      />
      <SInputMultilineForm
        label="Descrição"
        placeholder="descrição"
        fullWidth
        name="description"
      />
      {Boolean(formModel?.id) && (
        <>
          <SPaper sx={{ p: 6, borderRadius: 1 }}>
            <SRadioForm
              disabled={disabled}
              label="Tipo de Link"
              name="shareableLink"
              options={[
                { value: 'true', label: 'Link único compartilhável' },
                { value: 'false', label: 'Link por funcionário' },
              ]}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
            />
          </SPaper>
          <SFlex>
            <SSwitchForm label="Anônimo" name="anonymous" disabled />
          </SFlex>
        </>
      )}
    </>
  );
};
