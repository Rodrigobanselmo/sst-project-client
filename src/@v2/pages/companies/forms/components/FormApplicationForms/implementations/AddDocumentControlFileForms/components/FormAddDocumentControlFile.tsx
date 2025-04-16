import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { FormDocumentControlFile } from '../../../components/FormDocumentControlFile';
import { FormDocumentControlFileInfo } from '../../../components/FormDocumentControlFileInfo';

type Props = {
  onUpload: (file: File) => Promise<string>;
};

export const FormAddDocumentControlFile = ({ onUpload }: Props) => {
  return (
    <SFormSection>
      <FormDocumentControlFile onUpload={onUpload} />
      <FormDocumentControlFileInfo />
    </SFormSection>
  );
};
