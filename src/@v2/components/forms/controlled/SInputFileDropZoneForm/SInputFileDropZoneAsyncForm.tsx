import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { Box } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';

import { findFirstNestedKeyValue } from '@v2/utils/find-first-key-value';
import { generateRandomString } from 'core/utils/helpers/generateRandomString';
import { SInputFileDropZone } from '../../fields/SInputFileDropZone/SInputFileDropZone';
import {
  FileDropZoneRejection,
  SInputFileDropZoneProps,
} from '../../fields/SInputFileDropZone/SInputFileDropZone.types';
import {
  FileDropZoneView,
  SInputFileDropZoneFilesView,
} from '../../fields/SInputFileDropZone/components/SInputFileDropZoneFilesView';
import { FileDropZoneErrorCodeMap } from '../../fields/SInputFileDropZone/maps/error-code.map';
import { getSizeInMbOrKb } from '@v2/utils/get-file-size';
import { getNestedError } from '../get-nested-error';

// export const Example = () => {
//   const uploadMutate = useMutateAddDocumentControlSystemFile();

//   const maxFileSize = 1024 * 1024 * 5;

//   const form = useForm({
//     // resolver: yupResolver(schemaEditDocumentControlForm),
//     defaultValues: {
//       files: [],
//     },
//   });

//   const onUpload = async (file: File) => {
//     const uploaded = await uploadMutate.mutateAsync({
//       file,
//       companyId: companyId,
//     });
//     return uploaded.id;
//   };

//   return (
//     <SForm form={form}>
//       <SInputFileDropZoneAsyncForm
//         name="files"
//         onUpload={onUpload}
//         accept={{
//           'image/png': ['.png'],
//           'image/jpeg': ['.jpg', '.jpeg'],
//           'application/pdf': ['.pdf'],
//         }}
//         maxSize={maxFileSize}
//         label={'PNG ou JPG (máx 5MB)'}
//       />
//     </SForm>
//   );
// };

interface SInputFileDropZoneAsyncFormProps
  extends Omit<SInputFileDropZoneProps, 'onDrop'> {
  onUpload: (file: File) => Promise<string>;
  name: string;
}

export const SInputFileDropZoneAsyncForm = ({
  name,
  icon = <CloudUploadOutlinedIcon sx={{ color: 'primary.main' }} />,
  onUpload,
  ...props
}: SInputFileDropZoneAsyncFormProps) => {
  const { setValue, formState, control } = useFormContext();

  const value = useWatch({ name, control }) as FileDropZoneView[];

  const error = getNestedError(formState?.errors, name);

  const errorMessage = error
    ? findFirstNestedKeyValue(error, 'message')
    : undefined;

  const handleUpload = async (
    files: File[],
    rejected: FileDropZoneRejection[],
  ) => {
    const newFiles = [...value];

    if (rejected.length > 0) {
      const errorFiles = rejected.map((file) => {
        const fileAsync = file.file as FileDropZoneView;
        fileAsync.id = fileAsync.name + generateRandomString(5);
        fileAsync.isUploaded = false;
        fileAsync.error = FileDropZoneErrorCodeMap[file.errors[0].code].replace(
          '{maxSize}',
          getSizeInMbOrKb(props.maxSize || 0),
        );
        return fileAsync;
      });

      newFiles.push(...errorFiles);
      setValue(name, newFiles, { shouldValidate: true, shouldDirty: true });
    }

    if (files.length > 0) {
      const localFiles = files.map((file) => {
        const fileAsync = file as FileDropZoneView;
        fileAsync.id = fileAsync.name + generateRandomString(5);
        return fileAsync;
      }) as FileDropZoneView[];

      newFiles.push(...localFiles);
      setValue(name, newFiles, { shouldValidate: true, shouldDirty: true });

      for (const file of localFiles) {
        await onUpload?.(file)
          .then((fileId) => {
            const index = newFiles.findIndex((f) => f.id === file.id);
            newFiles[index].id = fileId;
            newFiles[index].isUploaded = true;

            setValue(name, newFiles, {
              shouldValidate: true,
              shouldDirty: true,
            });
          })
          .catch(() => {
            const index = newFiles.findIndex((f) => f.id === file.id);
            newFiles[index].error = 'Erro ao fazer upload';

            setValue(name, newFiles, {
              shouldValidate: true,
              shouldDirty: true,
            });
          });
      }
    }
  };

  const onRemoveFile = (fileId: number | string) => {
    const newFiles = value.filter((file) => file.id !== fileId);
    setValue(name, newFiles, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Box>
      <SInputFileDropZone onDrop={handleUpload} {...props} />
      <SInputFileDropZoneFilesView files={value} onRemoveFile={onRemoveFile} />
      {errorMessage}
    </Box>
  );
};
