/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import SDownloadIcon from 'assets/icons/SDownloadIcon';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  buildPgrConsolidatedDownloadUrl,
  formatPgrAttachmentDisplayName,
  getPgrEssentialDownloadLabel,
  getPgrFullDownloadLabel,
  getPgrMainDocumentDownloadLabel,
} from '../../helpers/pgr-download-labels.util';
import { IUseDocs } from '../../hooks/useModalViewDocDownload';

export const ModalContentDoc = ({
  downloadMutation,
  docQuery,
  doc,
}: IUseDocs) => {
  const { companyId } = useGetCompanyId();
  const resolvedCompanyId = doc.companyId || companyId || '';
  const mainDocumentUrl = `${doc.downloadRoute}/${doc.id}/${resolvedCompanyId}`;
  const isPgrOrFrps =
    doc.documentType === DocumentTypeEnum.PGR ||
    doc.documentType === DocumentTypeEnum.FRPS;

  const essentialConsolidatedUrl = buildPgrConsolidatedDownloadUrl({
    docId: doc.id,
    companyId: resolvedCompanyId,
    profile: 'essential',
  });

  const fullConsolidatedUrl = buildPgrConsolidatedDownloadUrl({
    docId: doc.id,
    companyId: resolvedCompanyId,
    profile: 'full',
  });

  const isDownloading = (url: string) =>
    downloadMutation.isLoading &&
    !!downloadMutation.variables &&
    downloadMutation.variables === url;

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
          text={
            isPgrOrFrps && doc.documentType
              ? getPgrMainDocumentDownloadLabel(doc.documentType)
              : 'Baixar documento'
          }
          loading={isDownloading(mainDocumentUrl)}
          onClick={() => downloadMutation.mutate(mainDocumentUrl)}
          width={'100%'}
          large
          icon={SDownloadIcon}
        />
        {isPgrOrFrps && doc.documentType && (
          <>
            <STagButton
              text={getPgrEssentialDownloadLabel(doc.documentType)}
              loading={isDownloading(essentialConsolidatedUrl)}
              onClick={() => downloadMutation.mutate(essentialConsolidatedUrl)}
              width={'100%'}
              large
              icon={SDownloadIcon}
            />
            <STagButton
              text={getPgrFullDownloadLabel(doc.documentType)}
              loading={isDownloading(fullConsolidatedUrl)}
              onClick={() => downloadMutation.mutate(fullConsolidatedUrl)}
              width={'100%'}
              large
              icon={SDownloadIcon}
            />
          </>
        )}
        <SText mt={4} mb={0} color="text.light">
          Anexos
        </SText>
        {docQuery?.attachments &&
          docQuery.attachments.map((attachment) => {
            const attachmentUrl = `${doc.downloadAttRoute.replace(':docId', docQuery.id)}/${
              attachment.id
            }/${resolvedCompanyId}`;

            return (
              <STagButton
                mb={2}
                key={attachment.id}
                text={`Baixar ${formatPgrAttachmentDisplayName(attachment.name)}`}
                loading={isDownloading(attachmentUrl)}
                onClick={() => downloadMutation.mutate(attachmentUrl)}
                width={'100%'}
                large
                icon={SDownloadIcon}
              />
            );
          })}
      </SFlex>
    </Box>
  );
};
