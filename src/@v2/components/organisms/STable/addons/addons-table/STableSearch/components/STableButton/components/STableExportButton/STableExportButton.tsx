import { FC } from 'react';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { STableButton } from '../../STableButton';
import { STableExportButtonProps } from './STableExportButton.types';

export const STableExportButton: FC<STableExportButtonProps> = ({
  onClick,
  text,
}) => {
  return (
    <STableButton
      onClick={onClick}
      color="info"
      text={text ?? 'Exportar'}
      icon={FileDownloadOutlinedIcon}
    />
  );
};
