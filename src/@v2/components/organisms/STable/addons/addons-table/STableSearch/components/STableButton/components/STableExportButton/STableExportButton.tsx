import { FC, useState } from 'react';

import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import { STableButton } from '../../STableButton';
import { STableExportButtonProps } from './STableExportButton.types';

export const STableExportButton: FC<STableExportButtonProps> = ({
  onClick,
  text,
  disabled,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <STableButton
      onClick={async (e) => {
        setIsLoading(true);
        return onClick(e).then(() => {
          setIsLoading(false);
        });
      }}
      disabled={disabled}
      loading={isLoading}
      color="info"
      text={text ?? 'Exportar'}
      icon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
    />
  );
};
