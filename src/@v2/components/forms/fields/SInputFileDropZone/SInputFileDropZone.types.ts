import { Accept, FileRejection } from 'react-dropzone';

export type FileDropZoneRejection = FileRejection;
export type AcceptDropZone = Accept;

export interface SInputFileDropZoneProps {
  accept: AcceptDropZone;
  icon?: React.ReactNode;
  label: React.ReactNode;
  disabled?: boolean;
  maxFiles?: number;
  onDrop?: (
    acceptedFiles: File[],
    fileRejections: FileDropZoneRejection[],
  ) => void;
  maxSize?: number;
}
