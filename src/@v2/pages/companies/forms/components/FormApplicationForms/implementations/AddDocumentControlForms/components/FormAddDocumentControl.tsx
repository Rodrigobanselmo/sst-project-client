import { SFormLabel } from '@v2/components/forms/components/SFormLabel/SFormLabel';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { FormDocumentControl } from '../../../components/FormDocumentControl';
import { FormDocumentControlFile } from '../../../components/FormDocumentControlFile';

type Props = {
  onUpload: (file: File) => Promise<string>;
};

export const FormAddDocumentControl = ({ onUpload }: Props) => {
  return (
    <SFormSection>
      <FormDocumentControl />
      <SFormLabel>Arquivo</SFormLabel>
      <FormDocumentControlFile onUpload={onUpload} />
    </SFormSection>
  );
};
