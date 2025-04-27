export enum ErrorCode {
  FileInvalidType = 'file-invalid-type',
  FileTooLarge = 'file-too-large',
  FileTooSmall = 'file-too-small',
  TooManyFiles = 'too-many-files',
}

export const FileDropZoneErrorCodeMap = {
  [ErrorCode.FileInvalidType]: 'Tipo de arquivo inválido',
  [ErrorCode.FileTooLarge]: 'Arquivo maior que o permitido de {maxSize}',
  [ErrorCode.FileTooSmall]: 'Arquivo muito pequeno',
  [ErrorCode.TooManyFiles]: 'Muitos arquivos',
} as const;
