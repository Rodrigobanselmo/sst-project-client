/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';

import { Box, Checkbox, FormControlLabel } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import SDownloadIcon from 'assets/icons/SDownloadIcon';

import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import { PCMSO_DOWNLOAD_SECTION_DOCUMENT } from '../../helpers/pcmso-download-labels.util';
import {
  buildPcmsoCustomCompositionDownloadUrl,
  getPcmsoCompositionCheckboxes,
  getPcmsoCustomCompositionToggleLabel,
  getPcmsoCustomDownloadButtonLabel,
  PCMSO_COMPOSITION_GROUP_TITLES,
  sortPcmsoCompositionParts,
  type PcmsoCompositionPart,
} from '../../helpers/pcmso-download-composition.util';
import {
  buildPcmsoDownloadModalOptions,
  groupPcmsoDownloadOptionsBySection,
  isPcmsoDownloadUrlLoading,
} from '../../helpers/pcmso-download-modal.util';
import { PGR_DOWNLOAD_SECTION_DOCUMENT } from '../../helpers/pgr-download-labels.util';
import {
  buildPgrCustomCompositionDownloadUrl,
  getPgrCompositionCheckboxes,
  getPgrCustomCompositionToggleLabel,
  getPgrCustomDownloadButtonLabel,
  PGR_COMPOSITION_GROUP_TITLES,
  sortPgrCompositionParts,
  type PgrCompositionPart,
} from '../../helpers/pgr-download-composition.util';
import {
  buildPgrDownloadModalOptions,
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

type CompositionCheckboxView = {
  id: string;
  group: string;
  label: string;
  description?: string;
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
  const [customExpanded, setCustomExpanded] = useState(false);
  const [selectedPgrParts, setSelectedPgrParts] = useState<PgrCompositionPart[]>(
    [],
  );
  const [selectedPcmsoParts, setSelectedPcmsoParts] = useState<
    PcmsoCompositionPart[]
  >([]);

  useEffect(() => {
    setCustomExpanded(false);
    setSelectedPgrParts([]);
    setSelectedPcmsoParts([]);
  }, [doc.id]);

  const pgrCheckboxes = useMemo(
    () => (doc.documentType ? getPgrCompositionCheckboxes(doc.documentType) : []),
    [doc.documentType],
  );
  const pcmsoCheckboxes = useMemo(() => getPcmsoCompositionCheckboxes(), []);
  const pgrCustomDownloadUrl = buildPgrCustomCompositionDownloadUrl({
    docId: doc.id,
    companyId: resolvedCompanyId,
    parts: selectedPgrParts,
  });
  const pcmsoCustomDownloadUrl = buildPcmsoCustomCompositionDownloadUrl({
    docId: doc.id,
    companyId: resolvedCompanyId,
    parts: selectedPcmsoParts,
  });

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

  const renderCustomComposition = (params: {
    checkboxes: CompositionCheckboxView[];
    groupOrder: string[];
    groupTitles: Record<string, string>;
    selectedIds: string[];
    toggleLabel: string;
    downloadLabel: string;
    downloadUrl: string | null;
    onToggleExpand: () => void;
    onTogglePart: (id: string) => void;
  }) => (
    <>
      <STagButton
        text={params.toggleLabel}
        onClick={params.onToggleExpand}
        width={'100%'}
        large
        outline
      />
      {customExpanded && (
        <Box>
          {params.groupOrder.map((groupId) => {
            const groupOptions = params.checkboxes.filter(
              (item) => item.group === groupId,
            );
            if (groupOptions.length === 0) return null;
            return (
              <Box key={groupId} mt={groupId === params.groupOrder[0] ? 0 : 4}>
                <SText mb={1} fontSize={13} color="text.light">
                  {params.groupTitles[groupId]}
                </SText>
                {groupOptions.map((item) => (
                  <Box key={item.id} mb={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={params.selectedIds.includes(item.id)}
                          onChange={() => params.onTogglePart(item.id)}
                        />
                      }
                      label={item.label}
                    />
                    {item.description && (
                      <SText ml={4} mb={0} fontSize={12} color="text.light">
                        {item.description}
                      </SText>
                    )}
                  </Box>
                ))}
              </Box>
            );
          })}
          <Box mt={4}>
            <STagButton
              text={params.downloadLabel}
              loading={
                !!params.downloadUrl && isDownloading(params.downloadUrl)
              }
              disabled={!params.downloadUrl || downloadMutation.isLoading}
              onClick={() => {
                if (!params.downloadUrl || downloadMutation.isLoading) {
                  return;
                }
                downloadMutation.mutate(params.downloadUrl);
              }}
              width={'100%'}
              large
              icon={SDownloadIcon}
            />
          </Box>
        </Box>
      )}
    </>
  );

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
          <SFlex direction="column" gap={5} mt={5} mb={10}>
            {renderDocumentButtons(pcmsoGrouped.document)}
            {renderCustomComposition({
              checkboxes: pcmsoCheckboxes,
              groupOrder: ['main', 'annexes'],
              groupTitles: PCMSO_COMPOSITION_GROUP_TITLES,
              selectedIds: selectedPcmsoParts,
              toggleLabel: getPcmsoCustomCompositionToggleLabel(),
              downloadLabel: getPcmsoCustomDownloadButtonLabel(),
              downloadUrl: pcmsoCustomDownloadUrl,
              onToggleExpand: () => setCustomExpanded((open) => !open),
              onTogglePart: (id) => {
                setSelectedPcmsoParts((current) => {
                  const next = new Set(current);
                  const part = id as PcmsoCompositionPart;
                  if (next.has(part)) next.delete(part);
                  else next.add(part);
                  return sortPcmsoCompositionParts(next);
                });
              },
            })}
          </SFlex>
        </>
      )}

      {isPgrOrFrps && (
        <>
          <SText mt={8} color="text.light">
            {PGR_DOWNLOAD_SECTION_DOCUMENT}
          </SText>
          <SFlex direction="column" gap={5} mt={5} mb={10}>
            {renderDocumentButtons(pgrGrouped.document)}
            {renderCustomComposition({
              checkboxes: pgrCheckboxes,
              groupOrder: ['main', 'inventory', 'action_plan'],
              groupTitles: PGR_COMPOSITION_GROUP_TITLES,
              selectedIds: selectedPgrParts,
              toggleLabel: getPgrCustomCompositionToggleLabel(),
              downloadLabel: getPgrCustomDownloadButtonLabel(),
              downloadUrl: pgrCustomDownloadUrl,
              onToggleExpand: () => setCustomExpanded((open) => !open),
              onTogglePart: (id) => {
                setSelectedPgrParts((current) => {
                  const next = new Set(current);
                  const part = id as PgrCompositionPart;
                  if (next.has(part)) next.delete(part);
                  else next.add(part);
                  return sortPgrCompositionParts(next);
                });
              },
            })}
          </SFlex>
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
