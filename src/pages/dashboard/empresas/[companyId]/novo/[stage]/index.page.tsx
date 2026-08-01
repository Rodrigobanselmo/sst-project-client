import { Box, Icon } from '@mui/material';
import { SActionNextButton } from 'components/atoms/SActionNextButton';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { ModalAddDocPCMSOVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPCMSOVersion';
import { ModalAddDocPGRVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPGRVersion';
import { ModalAddExam } from 'components/organisms/modals/ModalAddExam/ModalAddExam';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { ModalAddProtocol } from 'components/organisms/modals/ModalAddProtocol/ModalAddProtocol';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { ModalEditDocumentModelData } from 'components/organisms/modals/ModalEditDocumentModel/ModalEditDocumentModel';
import { StackModalEditEmployee } from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { ModalEditExamRisk } from 'components/organisms/modals/ModalEditExamRisk/ModalEditExamRisk';
import { ModalEditProtocolRisk } from 'components/organisms/modals/ModalEditProtocolRisk/ModalEditProtocolRisk';
import { ModalImportExport } from 'components/organisms/modals/ModalImportExport';
import {
  GhoEditorProvider,
  StackModalAddGho,
} from 'components/organisms/modals/ModalAddGHO';
import { StackModalRiskTool } from 'components/organisms/modals/ModalRiskTool';
import { ModalSelectClinic } from 'components/organisms/modals/ModalSelectClinics';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { StackModalViewDocumentModels } from 'components/organisms/modals/ModalViewDocumentModels/ModalViewDocumentModels';
import { StackModalViewDocuments } from 'components/organisms/modals/ModalViewDocuments/ModalViewDocuments';
import { ModalViewExam } from 'components/organisms/modals/ModalViewExam/ModalViewExam';
import { ModalViewProfessional } from 'components/organisms/modals/ModalViewProfessional';
import {
  ModalViewUsers,
  StackModalViewUsers,
} from 'components/organisms/modals/ModalViewUsers/ModalViewUsers';
import { EmployeesTable } from 'components/organisms/tables/EmployeesTable/EmployeesTable';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dynamic from 'next/dynamic';
import { NextPage } from 'next';
import { StatusEnum } from 'project/enum/status.enum';

import { SArrowNextIcon } from 'assets/icons/SArrowNextIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { Alert } from '@mui/material';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { HOME_GROUP_CONSOLIDATED_STAGE_MESSAGE } from 'core/constants/home-business-group-scope.constants';
import { useCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { SActionButton } from '../../../../../../components/atoms/SActionButton';
import { CharacterizationSummaryToggle } from 'components/organisms/main/CompanyFlow/CharacterizationSummaryToggle';
import { CompanyHomeSummaryCards } from 'components/organisms/main/CompanyFlow/CompanyHomeSummaryCards';
import { CompanyWorkspaceContextualNav } from 'components/organisms/main/CompanyFlow/CompanyWorkspaceContextualNav';
import {
  CompanyWorkspaceCardsProvider,
  useCompanyWorkspaceCardsCollapsed,
} from 'core/hooks/useCompanyWorkspaceCardsCollapsed';
import { CharacterizationStage } from './components/CharacterizationStage/CharacterizationStage';
import { CompanyHomeOperationalHeader } from './components/CompanyHomeOperationalHeader/CompanyHomeOperationalHeader';
import { CompanyStage } from './components/CompanyStage/CompanyStage';
import { DocumentsStage } from './components/DocumentsStage /DocumentsStage';
import { EmployeeStage } from './components/EmployeeStage/EmployeeStage';
import {
  CharacterizationInlineEditorProvider,
  useCharacterizationInlineEditor,
} from './context/CharacterizationInlineEditorContext';
import { SCompanyPermissions } from 'components/molecules/SCompanyPermissions/SCompanyPermissions';
import { SButton } from 'components/atoms/SButton';
import { useModal } from 'core/hooks/useModal';
import { ModalEnum } from 'core/enums/modal.enums';

const ModalSelectCharacterization = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectCharacterization').then(
      ({ ModalSelectCharacterization }) => ModalSelectCharacterization,
    ) as any,
  { ssr: false },
) as any;

const ModalSelectCompany = dynamic(
  () =>
    import('components/organisms/modals/ModalSelectCompany').then(
      ({ ModalSelectCompany }) => ModalSelectCompany,
    ) as any,
  { ssr: false },
) as any;

const ModalUploadPhoto = dynamic(
  () =>
    import('components/organisms/modals/ModalUploadPhoto').then(
      ({ ModalUploadPhoto }) => ModalUploadPhoto,
    ) as any,
  { ssr: false },
) as any;

const CompanyPage: NextPage = () => {
  const props = useCompanyStep();
  const pageTitle = props.isGroupConsolidated
    ? props.businessGroupName || getCompanyName(props.company)
    : getCompanyName(props.company);

  return (
    <>
      <SHeaderTag hideInitial title={pageTitle} />

      <SContainer>
        <CharacterizationInlineEditorProvider>
          <CompanyWorkspaceCardsProvider>
            <CompanyPageLayout {...props} />
          </CompanyWorkspaceCardsProvider>
        </CharacterizationInlineEditorProvider>
      </SContainer>
    </>
  );
};

const CompanyPageLayout = (props: ReturnType<typeof useCompanyStep>) => {
  const { onStackOpenModal } = useModal();
  const { isInlineEditOpen } = useCharacterizationInlineEditor();
  const { collapsed: summaryCollapsed } = useCompanyWorkspaceCardsCollapsed();

  const {
    company,
    isLoading,
    pageGroupMemo,
    launchCardsMemo,
    formsLaunchGroup,
    showFormsLaunchGroup,
    actionPlanLaunchGroup,
    showActionPlanLaunchGroup,
    stage,
    stepsActionsList,
    handleUploadRisk,
    isGroupConsolidated,
    businessGroupName,
  } = props;

  useFetchFeedback(isLoading && !company?.id);
  const companyName = isGroupConsolidated
    ? businessGroupName || getCompanyName(company)
    : getCompanyName(company);

  const isCharacterizationStage =
    CompanyActionEnum.SST_GROUP_PAGE === stage;
  const isPrimaryCompanyStage =
    stage === CompanyActionEnum.COMPANY_GROUP_PAGE ||
    stage === CompanyActionEnum.EMPLOYEES_GROUP_PAGE ||
    stage === CompanyActionEnum.SST_GROUP_PAGE ||
    stage === CompanyActionEnum.DOCUMENTS_GROUP_PAGE;
  const hideHomeSummaryCards =
    (isCharacterizationStage && isInlineEditOpen) ||
    (isPrimaryCompanyStage && summaryCollapsed);
  const showCompanySummaryCardsToggle =
    isPrimaryCompanyStage &&
    !(isCharacterizationStage && isInlineEditOpen);

  return (
    <>
        <CompanyHomeOperationalHeader
          companyName={companyName}
          stepsActionsList={stepsActionsList}
          headerActions={
            <Box ml="auto" sx={{ flexShrink: 0 }}>
              <SFlex gap={5} flexWrap="wrap" justify="flex-end">
                <SButton
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={handleUploadRisk}
                >
                  Importar Planilha
                </SButton>
                <SButton
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => onStackOpenModal(ModalEnum.REPORT_SELECT)}
                >
                  Baixar Relatorios
                </SButton>
              </SFlex>
            </Box>
          }
        />

        {showCompanySummaryCardsToggle && (
          <SFlex
            align="center"
            justify="space-between"
            gap={1.5}
            sx={{ width: '100%', mb: 1, flexWrap: { xs: 'wrap', md: 'nowrap' } }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <CompanyWorkspaceContextualNav companyId={company?.id} />
            </Box>
            <CharacterizationSummaryToggle />
          </SFlex>
        )}

        {!hideHomeSummaryCards && (
          <CompanyHomeSummaryCards
            pageGroupMemo={pageGroupMemo}
            launchCardsMemo={launchCardsMemo}
            formsLaunchGroup={formsLaunchGroup}
            showFormsLaunchGroup={showFormsLaunchGroup}
            actionPlanLaunchGroup={actionPlanLaunchGroup}
            showActionPlanLaunchGroup={showActionPlanLaunchGroup}
            stage={stage}
            company={company}
            isGroupConsolidated={isGroupConsolidated}
          />
        )}

        {isGroupConsolidated &&
          stage !== pageGroupMemo[0]?.type && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {HOME_GROUP_CONSOLIDATED_STAGE_MESSAGE}
            </Alert>
          )}

        {!isGroupConsolidated &&
          CompanyActionEnum.EMPLOYEES_GROUP_PAGE == stage && <EmployeeStage />}

        {!isGroupConsolidated &&
          CompanyActionEnum.COMPANY_GROUP_PAGE == stage && (
          <CompanyStage {...props} />
        )}

        {!isGroupConsolidated &&
          CompanyActionEnum.SST_GROUP_PAGE == stage && (
          <GhoEditorProvider>
            <CharacterizationStage {...props} />
            <StackModalAddGho
              includeHierarchySelect={false}
              embedInParentProvider
            />
          </GhoEditorProvider>
        )}

        {!isGroupConsolidated &&
          CompanyActionEnum.DOCUMENTS_GROUP_PAGE == stage && (
          <>
            <DocumentsStage {...props} />
            <StackModalViewDocumentModels />
            <ModalEditDocumentModelData />
          </>
        )}

        <StackModalRiskTool />
        {CompanyActionEnum.SST_GROUP_PAGE != stage && (
          <StackModalAddGho includeHierarchySelect={false} />
        )}
        <ModalViewProfessional />
        <ModalSingleInput />
        <StackModalEditEmployee />
        <ModalSelectHierarchy />
        <ModalAddWorkspace />
        <ModalAddExcelEmployees />
        <ModalAddRiskGroup />
        <ModalShowHierarchyTree />
        <ModalSelectWorkspace />
        <ModalSelectCharacterization />
        <ModalSelectCompany />
        <ModalSelectDocPgr />
        <ModalUploadPhoto />
        <ModalAddExam />
        <ModalAddProtocol />
        <ModalViewExam />
        <ModalEditExamRisk />
        <ModalEditProtocolRisk />
        <ModalImportExport />

        <ModalViewUsers />
        <StackModalViewUsers />
        <StackModalViewDocuments />
    </>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
