import { Wizard } from 'react-use-wizard';

import { Box, BoxProps } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import SFlex from 'components/atoms/SFlex';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddDocPCMSOVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPCMSOVersion';
import { ModalAddDocPGRVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPGRVersion';
import { ModalAddDocPERICULOSIDADEVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPERICULOSIDADEVersion';
import { ModalAddDocLTCATVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocLTCATVersion';
import { ModalAddDocINSALUBRIDADEVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocINSALUBRIDADEVersion';
import { DocTable } from 'components/organisms/tables/DocTable';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useRouter } from 'next/router';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { useEffect, useMemo } from 'react';

import SDocumentVersionIcon from 'assets/icons/SDocumentVersionIcon';

import { IUseCompanyStep } from 'core/hooks/action-steps/useCompanyStep';

export interface ICompanyStage extends Partial<BoxProps>, IUseCompanyStep {}

export const DocumentsStage = ({
  documentsStepMemo,
  documentsModelsStepMemo,
  query,
  ...props
}: ICompanyStage) => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const tabWorkspaceId = router.query.tabWorkspaceId as string | undefined;

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId: companyId || '',
  });

  const sortedFirstId = useMemo(() => {
    if (!workspaces?.results?.length) return undefined;
    return [...workspaces.results]
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      )[0]?.id;
  }, [workspaces?.results]);

  useEffect(() => {
    if (workspaces?.results?.length !== 1) return;
    if (!sortedFirstId || tabWorkspaceId) return;

    const nextQuery = { ...router.query, tabWorkspaceId: sortedFirstId };
    void router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true },
    );
  }, [
    router,
    sortedFirstId,
    tabWorkspaceId,
    workspaces?.results?.length,
  ]);

  const selectedWorkspaceName = useMemo(() => {
    if (!tabWorkspaceId) return undefined;
    return workspaces?.results?.find((workspace) => workspace.id === tabWorkspaceId)
      ?.name;
  }, [tabWorkspaceId, workspaces?.results]);

  return (
    <Box {...props}>
      <SText mt={20}>Controle de Vencimento</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {documentsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>
      <SText mt={20}>Modelos</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap" mb={25}>
        {documentsModelsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>
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
            <WizardTabs
              shadow
              onUrl
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
                  label: 'LTCAT',
                },
                {
                  label: 'INSALUBRIDADE',
                },
              ]}
            />
          }
        >
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.PGR}
              query={{ type: DocumentTypeEnum.PGR, workspaceId: tabWorkspaceId }}
            />
            <ModalAddDocPGRVersion />
          </>
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.PCSMO}
              query={{ type: DocumentTypeEnum.PCSMO, workspaceId: tabWorkspaceId }}
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
            />
            <ModalAddDocPERICULOSIDADEVersion />
          </>
          <>
            <DocTable
              workspaceId={tabWorkspaceId}
              workspaceName={selectedWorkspaceName}
              type={DocumentTypeEnum.LTCAT}
              query={{ type: DocumentTypeEnum.LTCAT, workspaceId: tabWorkspaceId }}
            />
            <ModalAddDocLTCATVersion />
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
            />
            <ModalAddDocINSALUBRIDADEVersion />
          </>
        </Wizard>
      )}
    </Box>
  );
};
