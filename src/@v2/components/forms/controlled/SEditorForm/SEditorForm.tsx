import { useFormContext, useWatch } from 'react-hook-form';
import { SEditor, SEditorProps } from '../../fields/SEditor/SEditor';
import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { getNestedError } from '../get-nested-error';

interface SEditorFormProps extends SEditorProps {
  name: string;
}

export function SEditorForm({
  name,
  readOnly,
  ...props
}: SEditorFormProps) {
  const { setValue, formState, control } = useFormContext();
  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const value = useWatch({ name, control }) || '';

  return (
    <div>
      <SEditor
        {...props}
        readOnly={readOnly}
        value={value}
        error={!!error}
        onChange={
          readOnly
            ? undefined
            : (val: string) => {
                setValue(name, val);
              }
        }
      />
      {errorMessage && (
        <div style={{ color: '#d32f2f', fontSize: 13, marginTop: 4 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
