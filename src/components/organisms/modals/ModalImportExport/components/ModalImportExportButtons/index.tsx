/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import SDownloadIcon from 'assets/icons/SDownloadIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';

import { IUseModalImportExport } from '../../hooks/useModalImportExport';

export const ModalImportExportButtons = ({
  fileData,
  onDownload,
  isDownloadLoading,
  handleRemove,
}: IUseModalImportExport) => {
  return (
    <>
      {fileData.removeButton && (
        <SButton onClick={handleRemove} xsmall color="error">
          Remover
        </SButton>
      )}
      <SFlex gap={8} mt={5} mb={10}>
        <STagButton
          text="Baixar planilha modelo"
          loading={isDownloadLoading}
          onClick={onDownload}
          width={'200px'}
          large
          icon={SDownloadIcon}
        />
      </SFlex>
    </>
  );
};
