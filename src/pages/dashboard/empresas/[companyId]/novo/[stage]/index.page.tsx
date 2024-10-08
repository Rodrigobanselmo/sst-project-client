import { Box, Icon } from '@mui/material';
import { SActionGroupButton } from 'components/atoms/SActionGroupButton';
import { SActionNextButton } from 'components/atoms/SActionNextButton';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SIconButton from 'components/atoms/SIconButton';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
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
import { NextPage } from 'next';
import { StatusEnum } from 'project/enum/status.enum';

import { SArrowNextIcon } from 'assets/icons/SArrowNextIcon';
import SClinicIcon from 'assets/icons/SClinicIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { useCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { SActionButton } from '../../../../../../components/atoms/SActionButton';
import { CharacterizationStage } from './components/CharacterizationStage/CharacterizationStage';
import { CompanyStage } from './components/CompanyStage/CompanyStage';
import { DocumentsStage } from './components/DocumentsStage /DocumentsStage';
import { EmployeeStage } from './components/EmployeeStage/EmployeeStage';
import { SCompanyPermissions } from 'components/molecules/SCompanyPermissions/SCompanyPermissions';
import { SActionStepCheck } from 'components/atoms/SActionStepCheck';
import { SButton } from 'components/atoms/SButton';
import { useModal } from 'core/hooks/useModal';
import { ModalEnum } from 'core/enums/modal.enums';

const CompanyPage: NextPage = () => {
  const { onStackOpenModal } = useModal();
  const props = useCompanyStep();

  const {
    company,
    isLoading,
    pageGroupMemo,
    stage,
    stepsActions,
    stepsActionsList,
  } = props;

  useFetchFeedback(isLoading && !company?.id);
  const companyName = getCompanyName(company);

  return (
    <>
      <SHeaderTag hideInitial title={companyName} />

      <SContainer>
        <SPageTitle
          icon={SClinicIcon}
          rightElement={
            <Box ml="auto">
              <SFlex gap={5}>
                <SButton
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => console.log('upload')}
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
        >
          {companyName}
        </SPageTitle>

        {stepsActionsList.length != 0 && (
          <SFlex mt={5} gap={35} overflow="auto" mb={15}>
            {stepsActionsList.map(({ group, items }) => (
              <Box key={group} minWidth="fit-content">
                <SText fontSize={12}>{group}</SText>
                <Box mt={3} gap={2} display={'flex'} flexDirection={'column'}>
                  {items.map(({ ...props }, index) => (
                    <SActionStepCheck
                      index={index}
                      key={props.text}
                      {...props}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </SFlex>
        )}

        <SFlex mt={5} gap={10} flexWrap="wrap" mb={30}>
          {pageGroupMemo.map(({ color, ...props }) => (
            <SActionGroupButton
              key={props.text}
              active={stage == props.type}
              color={color as string}
              {...props}
            />
          ))}
        </SFlex>

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
