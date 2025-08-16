import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SFlexProps } from '@v2/components/atoms/SFlex/SFlex.types';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SSwitchForm } from '@v2/components/forms/controlled/SSwitchForm/SSwitchForm';
import { FormModelTypesFilterList } from '@v2/models/form/maps/form-model-type-map';

type Props = {
  containerProps?: SFlexProps;
};

export const FormModelInfo = (props: Props) => {
  return (
    <SFormSection {...props.containerProps}>
      <SInputForm
        label="Título"
        placeholder="título"
        fullWidth
        autoFocus
        name="title"
      />
      <SInputMultilineForm
        label="Descrição"
        placeholder="descrição"
        fullWidth
        inputProps={{ minRows: 3 }}
        name="description"
      />
      <SFlex>
        <SSearchSelectForm
          label="Tipo"
          placeholder="selecione o tipo"
          name="type"
          options={FormModelTypesFilterList}
          getOptionLabel={(option) => option.label}
          disabled
          getOptionValue={(option) => option.value}
        />
        <SSwitchForm label="Anônimo" name="anonymous" disabled />
        <SSwitchForm
          label="Link compartilhável"
          name="shareableLink"
          disabled
        />
      </SFlex>
    </SFormSection>
  );
};
