/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import SDownloadIcon from 'assets/icons/SDownloadIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';

import { IUseEditEmployees } from '../../hooks/useEditHierarchies';

export const ModalExportEmployees = ({
  downloadMutation,
  hierarchyData,
}: IUseEditEmployees) => {
  const { companyId } = useGetCompanyId();
  const { onOpenModal } = useModal();

  return (
    <>
      <SText mt={8} color="text.light">
        Inserir via planilha
      </SText>
      <SFlex gap={8} mt={5} mb={10}>
        <STagButton
          text="Baixar"
          loading={
            downloadMutation.isLoading &&
            !!downloadMutation.variables &&
            !!downloadMutation.variables.includes(
              ApiRoutesEnum.DOWNLOAD_HIERARCHIES,
            )
          }
          onClick={() =>
            downloadMutation.mutate(
              ApiRoutesEnum.DOWNLOAD_HIERARCHIES +
                `/${hierarchyData.companyId || companyId}`,
            )
          }
          width={'100%'}
          large
          icon={SDownloadIcon}
        />
        <STagButton
          text="Enviar"
          width={'100%'}
          large
          icon={SUploadIcon}
          onClick={() =>
            onOpenModal(
              ModalEnum.UPLOAD,
              `${ApiRoutesEnum.UPLOAD_HIERARCHY}/${
                hierarchyData.companyId || companyId
              }`,
            )
          }
        />
      </SFlex>
    </>
  );
};
