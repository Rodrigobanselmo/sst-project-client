import { Box, Icon } from '@mui/material';
import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import { SActionGroupButton } from 'components/atoms/SActionGroupButton';
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

import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { useCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { SActionButton } from '../../../../../../components/atoms/SActionButton';
import { CharacterizationStage } from './components/CharacterizationStage/CharacterizationStage';
import { CompanyHomeFormsGroupCard } from './components/CompanyHomeFormsGroupCard/CompanyHomeFormsGroupCard';
import { CompanyHomeOperationalHeader } from './components/CompanyHomeOperationalHeader/CompanyHomeOperationalHeader';
import { companyHomeLaunchCardShellSx } from './components/company-home-launch.constants';
import { CompanyStage } from './components/CompanyStage/CompanyStage';
import { DocumentsStage } from './components/DocumentsStage /DocumentsStage';
import { EmployeeStage } from './components/EmployeeStage/EmployeeStage';
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

const CompanyPage: NextPage = () => {
  const { onStackOpenModal } = useModal();
  const props = useCompanyStep();

  const {
    company,
    isLoading,
    pageGroupMemo,
    launchCardsMemo,
    formsLaunchGroup,
    showFormsLaunchGroup,
    stage,
    stepsActions,
    stepsActionsList,
    handleUploadRisk,
  } = props;

  useFetchFeedback(isLoading && !company?.id);
  const companyName = getCompanyName(company);
  const topGridColumnCount = Math.max(1, pageGroupMemo.length);
  const launchGridColumnCount = Math.max(topGridColumnCount, 4);
  const homeCardsGridSx = {
    display: 'grid',
    gridTemplateColumns: `repeat(${topGridColumnCount}, minmax(0, 1fr))`,
    gap: 10,
    width: '100%',
    alignItems: 'stretch',
  };
  const launchCardsGridSx = {
    display: 'grid',
    gridTemplateColumns: `repeat(${launchGridColumnCount}, minmax(0, 1fr))`,
    gap: 10,
    width: '100%',
    alignItems: 'stretch',
  };

  return (
    <>
      <SHeaderTag hideInitial title={companyName} />

      <SContainer>
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

        <Box sx={{ ...homeCardsGridSx, mt: 2, mb: 30 }}>
          {pageGroupMemo.map(({ color, ...props }) => (
            <Box
              key={props.text}
              sx={{
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <SActionGroupButton
                active={stage == props.type}
                color={color as string}
                {...props}
                fillGridCell
                fillGridCellCompact
              />
            </Box>
          ))}
        </Box>
        {(launchCardsMemo.length > 0 || showFormsLaunchGroup) && (
          <>
            <SText mt={-8}>Lançamentos</SText>
            <Box sx={{ ...launchCardsGridSx, mt: 3, mb: 24 }}>
              {launchCardsMemo.map((raw, index) => {
                const cardProps = raw as ISActionButtonProps;
                return (
                  <Box key={`${cardProps.text}-${index}`} sx={companyHomeLaunchCardShellSx}>
                    <SActionGroupButton
                      text={cardProps.text}
                      icon={cardProps.icon}
                      onClick={cardProps.onClick}
                      tooltipText={cardProps.tooltipText}
                      infos={cardProps.infos}
                      disabled={cardProps.disabled}
                      loading={cardProps.loading}
                      statusLabel={cardProps.statusLabel}
                      participationPercent={cardProps.participationPercent}
                      fillGridCell
                      fillGridCellLaunch
                    />
                  </Box>
                );
              })}
              {showFormsLaunchGroup && (
                <Box
                  sx={{
                    ...companyHomeLaunchCardShellSx,
                    gridColumn: {
                      xs: '1 / -1',
                      sm: launchGridColumnCount >= 4 ? 'span 2' : 'span 1',
                    },
                  }}
                >
                  <CompanyHomeFormsGroupCard
                    companyId={company.id}
                    applications={formsLaunchGroup.applications}
                    isEmpty={formsLaunchGroup.isEmpty}
                    emptyMessage={formsLaunchGroup.emptyMessage}
                    onViewAll={formsLaunchGroup.onViewAll}
                  />
                </Box>
              )}
            </Box>
          </>
        )}

        {CompanyActionEnum.EMPLOYEES_GROUP_PAGE == stage && <EmployeeStage />}

        {CompanyActionEnum.COMPANY_GROUP_PAGE == stage && (
          <CompanyStage {...props} />
        )}

        {CompanyActionEnum.SST_GROUP_PAGE == stage && (
          <>
            <CharacterizationStage {...props} />
          </>
        )}

        {CompanyActionEnum.DOCUMENTS_GROUP_PAGE == stage && (
          <>
            <DocumentsStage {...props} />
            <StackModalViewDocumentModels />
            <ModalEditDocumentModelData />
          </>
        )}

        <StackModalRiskTool />
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
        <ModalSelectDocPgr />
        <ModalAddExam />
        <ModalAddProtocol />
        <ModalViewExam />
        <ModalEditExamRisk />
        <ModalEditProtocolRisk />
        <ModalImportExport />

        <ModalViewUsers />
        <StackModalViewUsers />
        <StackModalViewDocuments />
      </SContainer>
    </>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
