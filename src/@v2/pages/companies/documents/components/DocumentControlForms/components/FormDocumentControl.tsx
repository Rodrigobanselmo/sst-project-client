import { SInputForm } from '@v2/components/forms/controlled/SInputForm/SInputForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  DocumentControlTypeEnum,
  documentControlTypeList,
  IDocumentControlTypeOption,
} from '../constants/document-type.map';

export const FormDocumentControl = () => {
  const { control } = useFormContext();
  const typeOption = useWatch({
    name: 'type',
    control,
  }) as IDocumentControlTypeOption | null;

  return (
    <>
      <SInputForm
        label="Nome para identificação*"
        labelShrink="Nome*"
        placeholder="nome para identificação"
        fullWidth
        name="name"
      />
      <SSearchSelectForm
        boxProps={{ flex: 1 }}
        label="Tipo de Documento*"
        placeholder="selecione o tipo de documento"
        name="type"
        options={documentControlTypeList}
        getOptionLabel={(option) => option.content}
        getOptionValue={(option) => option.value}
      />
      {typeOption?.value === DocumentControlTypeEnum.OTHER && (
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
