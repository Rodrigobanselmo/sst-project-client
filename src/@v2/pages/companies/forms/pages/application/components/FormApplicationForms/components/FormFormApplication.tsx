import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { InputFormModelSelectForm } from '../inputs/InputFormModelSelect/InputFormModelSelectForm';
import { InputWorkspaceSelectMultipleForm } from '../inputs/InputWorkspaceSelect/InputWorkspaceSelectMultipleForm';

type Props = {
  companyId: string;
};

export const FormFormApplication = ({ companyId }: Props) => {
  return (
    <>
      <SInputForm
        label="Nome para identificação"
        labelShrink="Nome"
        placeholder="nome para identificação"
        fullWidth
        name="name"
      />
      <InputFormModelSelectForm companyId={companyId} name="form" />
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
    </>
  );
};
