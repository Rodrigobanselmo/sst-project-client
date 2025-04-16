import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';

export const FormDocumentControlFileInfo = () => {
  return (
    <>
      <SInputMultilineForm
        label="Descrição"
        placeholder="descrição"
        fullWidth
        name="description"
      />
    </>
  );
};
