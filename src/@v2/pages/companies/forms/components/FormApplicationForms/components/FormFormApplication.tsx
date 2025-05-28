import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  FormIdentifierTypeList,
  IFormIdentifierTypeOption,
} from '../constants/form-Identifier-type.map';
import { InputFormModelSelectForm } from '../inputs/InputFormModelSelect/InputFormModelSelectForm';
import { InputWorkspaceSelectMultiple } from '../inputs/InputWorkspaceSelect/InputWorkspaceSelectMultiple';
import { InputWorkspaceSelectMultipleForm } from '../inputs/InputWorkspaceSelect/InputWorkspaceSelectMultipleForm';

type Props = {
  companyId: string;
};

export const FormFormApplication = ({ companyId }: Props) => {
  const { control } = useFormContext();
  const typeOption = useWatch({
    name: 'type',
    control,
  }) as IFormIdentifierTypeOption | null;

  return (
    <>
      <SInputForm
        label="Nome para identificação*"
        labelShrink="Nome*"
        placeholder="nome para identificação"
        fullWidth
        name="name"
      />
      <InputFormModelSelectForm companyId={companyId} name="form" />
      <InputWorkspaceSelectMultipleForm
        companyId={companyId}
        name="workspaceIds"
      />
      {typeOption?.value === FormIdentifierTypeEnum.CUSTOM && (
        <SInputForm
          label="Descrição do tipo de documento*"
          labelShrink="Outro Tipo*"
          placeholder="coloque aqui o tipo de documento"
          fullWidth
          name="typeText"
        />
      )}
      <SInputMultilineForm
        label="Descrição"
        placeholder="descrição"
        fullWidth
        name="description"
      />
    </>
  );
};
