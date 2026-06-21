import { Wizard } from 'react-use-wizard';

import { Box, BoxProps } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import SFlex from 'components/atoms/SFlex';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import SWizardBox from 'components/atoms/SWizardBox';
import {
  companyFlowCompactPanelSx,
  companyFlowCompactShortcutButtonSx,
  COMPANY_FLOW_COMPACT_SHORTCUTS_FLEX_GAP,
  COMPANY_HOME_CARDS_GRID_GAP,
} from 'components/organisms/main/CompanyFlow/company-flow-compact-shortcuts.styles';
import { CompanyFlowStickySubheader } from 'components/organisms/main/CompanyFlow/CompanyFlowStickySubheader';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddDocPCMSOVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPCMSOVersion';
import { ModalAddDocPGRVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPGRVersion';
import { ModalAddDocPERICULOSIDADEVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPERICULOSIDADEVersion';
import { ModalAddDocLTCATVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocLTCATVersion';
import { ModalAddDocINSALUBRIDADEVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocINSALUBRIDADEVersion';
import { ModalAddDocFRPSVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocFRPSVersion';
import { DocTable } from 'components/organisms/tables/DocTable';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useRouter } from 'next/router';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { useEffect, useMemo } from 'react';

import SDocumentVersionIcon from 'assets/icons/SDocumentVersionIcon';

import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import {
  enrichPickableWorkspaces,
  pickDefaultWorkspace,
} from 'core/utils/helpers/pick-default-workspace.util';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const DocumentsStage = ({
  company,
  isLoading,
  documentsStepMemo,
  documentsModelsStepMemo,
  query,
  ...props
}: ICompanyStage) => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const { workspaceId: tabWorkspaceId, setWorkspaceId } = useTabWorkspaceId();

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId: companyId || '',
  });

  const defaultWorkspaceId = useMemo(() => {
    const pickable = enrichPickableWorkspaces(
      workspaces?.results,
      company?.workspace,
    );
    return pickDefaultWorkspace(pickable);
  }, [company?.workspace, workspaces?.results]);

  useEffect(() => {
    if (
      isLoadingAllWorkspaces ||
      isLoading ||
      !defaultWorkspaceId ||
      tabWorkspaceId
    ) {
      return;
    }

    setWorkspaceId(defaultWorkspaceId);
  }, [
    defaultWorkspaceId,
    isLoading,
    isLoadingAllWorkspaces,
    setWorkspaceId,
    tabWorkspaceId,
  ]);

  const selectedWorkspaceName = useMemo(() => {
    if (!tabWorkspaceId) return undefined;
    return workspaces?.results?.find((workspace) => workspace.id === tabWorkspaceId)
      ?.name;
  }, [tabWorkspaceId, workspaces?.results]);

  return (
    <Box
      {...props}
      sx={[
        { mt: -4 },
        ...(props.sx
          ? Array.isArray(props.sx)
            ? props.sx
            : [props.sx]
          : []),
      ]}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: COMPANY_HOME_CARDS_GRID_GAP,
          mt: 0,
          mb: 1.25,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={companyFlowCompactPanelSx}>
          <SText fontSize={11} fontWeight={600} color="text.secondary" lineHeight={1.2}>
            Controle de Vencimento
          </SText>
          <SFlex
            mt={0.75}
            gap={COMPANY_FLOW_COMPACT_SHORTCUTS_FLEX_GAP}
            flexWrap="wrap"
          >
            {documentsStepMemo.map((actionProps) => (
              <SActionButton
                key={actionProps.text}
                {...actionProps}
                sx={companyFlowCompactShortcutButtonSx}
              />
            ))}
          </SFlex>
        </Box>
        <Box sx={companyFlowCompactPanelSx}>
          <SText fontSize={11} fontWeight={600} color="text.secondary" lineHeight={1.2}>
            Modelos
          </SText>
          <SFlex
            mt={0.75}
            gap={COMPANY_FLOW_COMPACT_SHORTCUTS_FLEX_GAP}
            flexWrap="wrap"
          >
            {documentsModelsStepMemo.map((actionProps) => (
              <SActionButton
                key={actionProps.text}
                {...actionProps}
                sx={companyFlowCompactShortcutButtonSx}
              />
            ))}
          </SFlex>
        </Box>
      </Box>
      {isLoadingAllWorkspaces && <SSkeleton height={280} />}
      {!isLoadingAllWorkspaces && !workspaces?.results?.length && (
        <Box mb={2} mt={1} color="text.secondary" fontSize={13}>
          Cadastre um estabelecimento antes.
        </Box>
      )}
      {!isLoadingAllWorkspaces &&
        !!workspaces?.results?.length &&
        !tabWorkspaceId && (
          <Box mb={2} mt={1} color="text.secondary" fontSize={13}>
            Selecione um estabelecimento no header para carregar os documentos.
          </Box>
        )}

      {!isLoadingAllWorkspaces && !!tabWorkspaceId && (
        <Wizard
          header={
            <CompanyFlowStickySubheader>
              <WizardTabs
                shadow
                onUrl
                mt={0.75}
                mb={8}
                active={query.active ? Number(query.active) : 0}
                options={[
                {
                  label: 'PGR',
                },
                {
                  label: 'PCMSO',
                },
                {
                  label: 'PERICULOSIDADE',
                },
                {
                  label: 'INSALUBRIDADE',
                },
                {
                  label: 'LTCAT',
                },
                {
                  label: 'FRPS',
                },
              ]}
              />
            </CompanyFlowStickySubheader>
          }
        >
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.PGR}
              query={{ type: DocumentTypeEnum.PGR, workspaceId: tabWorkspaceId }}
              companyFlowSticky
              companyFlowBelowTabs
            />
            <ModalAddDocPGRVersion />
          </>
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.PCSMO}
              query={{ type: DocumentTypeEnum.PCSMO, workspaceId: tabWorkspaceId }}
              companyFlowSticky
              companyFlowBelowTabs
            />
            <ModalAddDocPCMSOVersion />
          </>
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.PERICULOSIDADE}
              query={{
                type: DocumentTypeEnum.PERICULOSIDADE,
                workspaceId: tabWorkspaceId,
              }}
              companyFlowSticky
              companyFlowBelowTabs
            />
            <ModalAddDocPERICULOSIDADEVersion />
          </>
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.INSALUBRIDADE}
              query={{
                type: DocumentTypeEnum.INSALUBRIDADE,
                workspaceId: tabWorkspaceId,
              }}
              companyFlowSticky
              companyFlowBelowTabs
            />
            <ModalAddDocINSALUBRIDADEVersion />
          </>
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.LTCAT}
              query={{ type: DocumentTypeEnum.LTCAT, workspaceId: tabWorkspaceId }}
              companyFlowSticky
              companyFlowBelowTabs
            />
            <ModalAddDocLTCATVersion />
          </>
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.FRPS}
              query={{
                type: DocumentTypeEnum.FRPS,
                workspaceId: tabWorkspaceId,
              }}
              companyFlowSticky
              companyFlowBelowTabs
            />
            <ModalAddDocFRPSVersion />
          </>
        </Wizard>
      )}
    </Box>
  );
};
