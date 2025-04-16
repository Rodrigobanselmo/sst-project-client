import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SInputFileAsyncForm } from '@v2/components/forms/controlled/SInputFileForm/SInputFileAsyncForm';

export const FormDocumentControlFile = ({
  onUpload,
}: {
  onUpload: (file: File) => Promise<string>;
}) => {
  return (
    <>
      <SInputFileAsyncForm
        label="Arquivo"
        placeholder="selecione um arquivo"
        fullWidth
        name="file"
        onUpload={onUpload}
      />
      <SFormRow>
        <SDatePickerForm
          boxProps={{ flex: 1 }}
          label="Data de início"
          name="startDate"
        />
        <SDatePickerForm
          boxProps={{ flex: 1 }}
          label="Data de fim"
          name="endDate"
        />
      </SFormRow>
    </>
  );
};
