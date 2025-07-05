import { useFormContext, useWatch } from 'react-hook-form';
import { SEditor, SEditorProps } from '../../fields/SEditor/SEditor';
import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';

interface SEditorFormProps extends SEditorProps {
  name: string;
}

export function SEditorForm({ name, ...props }: SEditorFormProps) {
  const { setValue, formState, control } = useFormContext();
  const error = formState?.errors[name];
  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;
  const value = useWatch({ name, control }) || '';

  return (
    <div>
      <SEditor
        {...props}
        value={value}
        onChange={(val: string) => setValue(name, val)}
      />
      {errorMessage && (
        <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 4 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
