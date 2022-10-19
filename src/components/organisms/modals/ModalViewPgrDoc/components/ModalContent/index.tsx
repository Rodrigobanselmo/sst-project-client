/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import SDownloadIcon from 'assets/icons/SDownloadIcon';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { IUseDocs } from '../../hooks/useModalViewPgrDoc';

export const ModalContentDoc = ({
  downloadMutation,
  docQuery,
  doc,
}: IUseDocs) => {
  const { companyId } = useGetCompanyId();

  return (
    <Box>
      <SFlex gap={8} direction="column">
        {docQuery.name && (
          <SInput
            size="small"
            variant="outlined"
            value={docQuery.name}
            fullWidth
            label="Identificação"
            labelPosition="center"
            noEffect
          />
        )}
        {docQuery.version && (
          <SInput
            size="small"
            variant="outlined"
            value={docQuery.version}
            fullWidth
            label="Versão"
            labelPosition="center"
            noEffect
          />
        )}
      </SFlex>
      <SText mt={8} color="text.light">
        Documento
      </SText>
      <SFlex direction="column" gap={5} mt={5} mb={10}>
        <STagButton
          text="Baixar documento"
          loading={
            downloadMutation.isLoading &&
            !!downloadMutation.variables &&
            !!downloadMutation.variables.includes(
              `${doc.downloadRoute}/${doc.id}/${doc.companyId || companyId}`,
            )
          }
          onClick={() =>
            downloadMutation.mutate(
              `${doc.downloadRoute}/${doc.id}/${doc.companyId || companyId}`,
            )
          }
          width={'100%'}
          large
          icon={SDownloadIcon}
        />
        <SText mt={4} mb={0} color="text.light">
          Anexos
        </SText>
        {docQuery?.attachments &&
          docQuery.attachments.map((attachment) => (
            <STagButton
              mb={2}
              key={attachment.id}
              text={'Baixar ' + attachment.name}
              loading={
                downloadMutation.isLoading &&
                !!downloadMutation.variables &&
                !!downloadMutation.variables.includes(attachment.id)
              }
              onClick={() =>
                downloadMutation.mutate(
                  `${doc.downloadAttRoute.replace(':docId', docQuery.id)}/${
                    attachment.id
                  }/${doc.companyId || companyId}`,
                )
              }
              width={'100%'}
              large
              icon={SDownloadIcon}
            />
          ))}
      </SFlex>
    </Box>
  );
};
