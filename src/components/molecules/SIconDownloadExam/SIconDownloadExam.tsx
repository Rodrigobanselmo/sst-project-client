import React, { FC, MouseEvent, useState } from 'react';

import { Box, Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { initialFileUploadState } from 'components/organisms/modals/ModalUploadNewFile/ModalUploadNewFile';

import SDocumentIcon from 'assets/icons/SDocumentIcon';
import { SDownloadIcon } from 'assets/icons/SDownloadIcon';
import { SUploadFileIcon } from 'assets/icons/SUploadFileIcon';
import { SUploadIcon } from 'assets/icons/SUploadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';

import { SMenu } from '../SMenu';
import { IMenuSearchOption } from '../SMenuSearch/types';
import { IAnchorEvent } from '../STagSelect/types';
import { ISIconUpload } from './types';

export const SIconDownloadExam: FC<ISIconUpload> = ({
  handleSelectMenu,
  disabled,
  isTag,
  text,
  loading,
  isActive,
  companyId,
  employeeId,
}) => {
  const [anchorEl, setAnchorEl] = useState<IAnchorEvent>(null);
  const downloadMutation = useMutDownloadFile();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onDownload = (base: string) => {
    if (!employeeId || !companyId) return;

    const path = base
      .replace(':employeeId', String(employeeId))
      .replace(':companyId', companyId);

    window.open(path, '_blank');
  };

  const handleSelect = (
    option: IMenuSearchOption,
    e: MouseEvent<HTMLLIElement>,
  ) => {
    e.stopPropagation();
    if (option.value == 1) {
      onDownload(RoutesEnum.PDF_GUIDE);
    }
    if (option.value == 2) {
      onDownload(RoutesEnum.PDF_KIT_EXAM);
    }
    if (option.value == 3) {
      onDownload(RoutesEnum.PDF_DOC_PCD);
    }

    handleSelectMenu && handleSelectMenu(option, e);
  };

  const handleSelectButton = (e: any) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  return (
    <Box>
      {isTag ? (
        <STagButton
          icon={SDocumentIcon}
          text={text || 'Baixar documentos'}
          onClick={handleSelectButton}
          loading={loading || downloadMutation.isLoading}
          iconProps={{ sx: isActive ? { color: 'info.main' } : {} }}
        />
      ) : (
        <SIconButton
          tooltip={text || 'Baixar documentos'}
          sx={{ width: 36, height: 36 }}
          onClick={handleSelectButton}
          loading={loading || downloadMutation.isLoading}
        >
          <Icon
            component={SDocumentIcon}
            sx={isActive ? { color: 'info.main' } : {}}
          />
        </SIconButton>
      )}
      <SMenu
        close={handleClose}
        isOpen={Boolean(anchorEl)}
        anchorEl={anchorEl}
        startAdornment={() => {
          return (
            <Icon sx={{ fontSize: 15, mr: 4 }} component={SDownloadIcon} />
          );
        }}
        handleSelect={handleSelect}
        options={[
          {
            name: 'Baixar Guia de Encaminhamento',
            value: 1,
            disabled: !companyId || !employeeId || disabled,
          },
          {
            name: 'Baixar Kit Médico',
            value: 2,
            disabled: !companyId || !employeeId || disabled,
          },
          {
            name: 'Baixar Laudo PCD',
            value: 3,
            disabled: !companyId || !employeeId || disabled,
          },
        ]}
      />
    </Box>
  );
};
