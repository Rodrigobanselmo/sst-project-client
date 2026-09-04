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
  PCMSO_DOWNLOAD_SECTION_ANNEXES,
  PCMSO_DOWNLOAD_SECTION_DOCUMENT,
} from '../../helpers/pcmso-download-labels.util';
import {
  buildPcmsoDownloadModalOptions,
  groupPcmsoDownloadOptionsBySection,
  isPcmsoDownloadUrlLoading,
} from '../../helpers/pcmso-download-modal.util';
import {
  PGR_DOWNLOAD_SECTION_ANNEXES,
  PGR_DOWNLOAD_SECTION_DOCUMENT,
} from '../../helpers/pgr-download-labels.util';
import {
  buildPgrDownloadModalOptions,
  groupPgrDownloadAnnexesByCategory,
  groupPgrDownloadOptionsBySection,
} from '../../helpers/pgr-download-modal.util';
import { IUseDocs } from '../../hooks/useModalViewDocDownload';

type DownloadOptionView = {
  id: string;
  url: string;
  label: string;
  description?: string;
  badge?: string;
  recommended?: boolean;
};

export const ModalContentDoc = ({
  downloadMutation,
  docQuery,
  doc,
}: IUseDocs) => {
  const { companyId } = useGetCompanyId();
  const resolvedCompanyId = doc.companyId || companyId || '';
  const resolvedWorkspaceId = doc.workspaceId || docQuery.workspaceId || '';
  const mainDocumentUrl = `${doc.downloadRoute}/${doc.id}/${resolvedCompanyId}`;
  const isPgrOrFrps =
    doc.documentType === DocumentTypeEnum.PGR ||
    doc.documentType === DocumentTypeEnum.FRPS;
  const isPcmso = doc.documentType === DocumentTypeEnum.PCSMO;

  const pcmsoOptions = isPcmso
    ? buildPcmsoDownloadModalOptions({
        docId: doc.id,
        companyId: resolvedCompanyId,
        workspaceId: resolvedWorkspaceId,
        mainDocumentUrl,
        downloadAttRoute: doc.downloadAttRoute,
        attachments: docQuery?.attachments,
      })
    : [];
  const pcmsoGrouped = groupPcmsoDownloadOptionsBySection(pcmsoOptions);

  const pgrOptions =
    isPgrOrFrps && doc.documentType
      ? buildPgrDownloadModalOptions({
          documentType: doc.documentType,
          docId: doc.id,
          companyId: resolvedCompanyId,
          mainDocumentUrl,
          downloadAttRoute: doc.downloadAttRoute,
          attachments: docQuery?.attachments,
        })
      : [];
  const pgrGrouped = groupPgrDownloadOptionsBySection(pgrOptions);
  const pgrAnnexGroups = groupPgrDownloadAnnexesByCategory(pgrGrouped.annexes);

  const isDownloading = (url: string) =>
    isPcmsoDownloadUrlLoading(url, downloadMutation);

  const renderDocumentButtons = (options: DownloadOptionView[]) =>
    options.map((option) => (
      <STagButton
        key={option.id}
        text={option.label}
        topText={option.badge}
        subText={option.description}
        loading={isDownloading(option.url)}
        onClick={() => downloadMutation.mutate(option.url)}
        width={'100%'}
        large
        icon={SDownloadIcon}
        outline={option.recommended}
        borderActive={option.recommended ? 'primary' : undefined}
      />
    ));

  const renderAnnexButtons = (
    options: DownloadOptionView[],
    opts?: { disableGseWithoutWorkspace?: boolean },
  ) =>
    options.map((option) => (
      <STagButton
        key={option.id}
        mb={2}
        text={option.label}
        subText={option.description}
        loading={isDownloading(option.url)}
        onClick={() => {
          if (
            !opts?.disableGseWithoutWorkspace ||
            !option.url.includes('/pcmso-exams-by-gse/') ||
            resolvedWorkspaceId
          ) {
            downloadMutation.mutate(option.url);
          }
        }}
        disabled={
          !!opts?.disableGseWithoutWorkspace &&
          option.id === 'pcmso-annex-gse' &&
          !resolvedWorkspaceId
        }
        width={'100%'}
        large
        icon={SDownloadIcon}
      />
    ));

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

      {isPcmso && (
        <>
          <SText mt={8} color="text.light">
            {PCMSO_DOWNLOAD_SECTION_DOCUMENT}
          </SText>
          <SFlex direction="column" gap={5} mt={5} mb={5}>
            {renderDocumentButtons(pcmsoGrouped.document)}
          </SFlex>
          <SText mt={4} mb={0} color="text.light">
            {PCMSO_DOWNLOAD_SECTION_ANNEXES}
          </SText>
          <SFlex direction="column" gap={5} mt={5} mb={10}>
            {renderAnnexButtons(pcmsoGrouped.annexes, {
              disableGseWithoutWorkspace: true,
            })}
          </SFlex>
        </>
      )}

      {isPgrOrFrps && (
        <>
          <SText mt={8} color="text.light">
            {PGR_DOWNLOAD_SECTION_DOCUMENT}
          </SText>
          <SFlex direction="column" gap={5} mt={5} mb={5}>
            {renderDocumentButtons(pgrGrouped.document)}
          </SFlex>
          <SText mt={4} mb={0} color="text.light">
            {PGR_DOWNLOAD_SECTION_ANNEXES}
          </SText>
          <Box mb={10}>
            {pgrAnnexGroups.categories.map((group) => (
              <Box key={group.id}>
                <SText mt={5} mb={0} fontSize={13} color="text.light">
                  {group.title}
                </SText>
                <SFlex direction="column" gap={5} mt={5} mb={2}>
                  {renderAnnexButtons(group.options)}
                </SFlex>
              </Box>
            ))}
            {pgrAnnexGroups.uncategorized.length > 0 && (
              <SFlex direction="column" gap={5} mt={5}>
                {renderAnnexButtons(pgrAnnexGroups.uncategorized)}
              </SFlex>
            )}
          </Box>
        </>
      )}

      {!isPcmso && !isPgrOrFrps && (
        <>
          <SText mt={8} color="text.light">
            Documento
          </SText>
          <SFlex direction="column" gap={5} mt={5} mb={10}>
            <STagButton
              text="Baixar documento"
              loading={isDownloading(mainDocumentUrl)}
              onClick={() => downloadMutation.mutate(mainDocumentUrl)}
              width={'100%'}
              large
              icon={SDownloadIcon}
            />
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
                    text={`Baixar ${attachment.name}`}
                    loading={isDownloading(attachmentUrl)}
                    onClick={() => downloadMutation.mutate(attachmentUrl)}
                    width={'100%'}
                    large
                    icon={SDownloadIcon}
                  />
                );
              })}
          </SFlex>
        </>
      )}
    </Box>
  );
};
