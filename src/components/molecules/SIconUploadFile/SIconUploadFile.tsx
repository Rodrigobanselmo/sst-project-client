import React, { FC, MouseEvent, useState } from 'react';

import { Box, Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { initialFileUploadState } from 'components/organisms/modals/ModalUploadNewFile/ModalUploadNewFile';

import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SUploadFileIcon } from 'assets/icons/SUploadFileIcon';
import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';

import { SMenu } from '../SMenu';
import { IMenuSearchOption } from '../SMenuSearch/types';
import { IAnchorEvent } from '../STagSelect/types';
import { ISIconUpload } from './types';

export const SIconUploadFile: FC<{ children?: any } & ISIconUpload> = ({
  handleSelectMenu,
  disabled,
  disabledDownload,
  disabledUpload,
  isTag,
  text,
  onUpload,
  onDownload,
  loading,
  isActive,
  downloadPath,
}) => {
  const { onCloseModal, onStackOpenModal } = useModal();
  const [anchorEl, setAnchorEl] = useState<IAnchorEvent>(null);
  const downloadMutation = useMutDownloadFile();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    e.stopPropagation();

    if (option.value == 1) {
      onStackOpenModal(ModalEnum.UPLOAD_NEW_FILE, {
        accept: '',
        onConfirm: ({ files }) => {
          if (files && files[0]) {
            onUpload?.(files[0]);
          }
        },
      } as Partial<typeof initialFileUploadState>);
    }
    if (option.value == 2) {
      onDownload?.();
      if (downloadPath) downloadMutation.mutate(downloadPath);
    }

    handleSelectMenu && handleSelectMenu(option, e);
  };

  const handleSelectButton = (e: any) => {
    if (disabled) return;

    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  return (
    <Box>
      {isTag ? (
        <STagButton
          icon={SUploadFileIcon}
          text={text || 'Adicinar arquivo'}
          onClick={handleSelectButton}
          loading={loading || downloadMutation.isLoading}
          iconProps={{ sx: isActive ? { color: 'info.main' } : {} }}
        />
      ) : (
        <SIconButton
          tooltip={text || 'Enviar arquivo'}
          sx={{ width: 36, height: 36 }}
          onClick={handleSelectButton}
          loading={loading || downloadMutation.isLoading}
        >
          <Icon
            component={SUploadFileIcon}
            sx={isActive ? { color: 'info.main' } : {}}
          />
        </SIconButton>
      )}
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        startAdornment={(option) => {
          if (option.value === 1)
            return (
              <Icon sx={{ fontSize: 15, mr: 4 }} component={SUploadIcon} />
            );
          if (option.value === 2)
            return (
              <Icon sx={{ fontSize: 15, mr: 4 }} component={SDownloadIcon} />
            );
        }}
        handleSelect={handleSelect}
        options={[
          { name: 'Enviar', value: 1, disabled: !onUpload || disabledUpload },
          {
            name: 'Baixar',
            value: 2,
            disabled: (!onDownload && !downloadPath) || disabledDownload,
          },
        ]}
      />
    </Box>
  );
};
