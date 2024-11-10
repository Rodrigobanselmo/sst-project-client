import { FC } from 'react';

import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { STableButton } from '../../STableButton';
import { STableImportButtonProps } from './STableImportButton.types';

export const STableImportButton: FC<STableImportButtonProps> = ({
  onClick,
  text,
}) => {
  return (
    <STableButton
      onClick={onClick}
      tooltip={text ?? 'Importar'}
      icon={<FileUploadOutlinedIcon sx={{ fontSize: 16 }} />}
      color="info"
    />
  );
};
