import { Icon } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SIconButton from 'components/atoms/SIconButton';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { ModalAddExam } from 'components/organisms/modals/ModalAddExam/ModalAddExam';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { ModalAddProtocol } from 'components/organisms/modals/ModalAddProtocol/ModalAddProtocol';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { ModalEditExamRisk } from 'components/organisms/modals/ModalEditExamRisk/ModalEditExamRisk';
import { ModalEditProtocolRisk } from 'components/organisms/modals/ModalEditProtocolRisk/ModalEditProtocolRisk';
import { ModalImportExport } from 'components/organisms/modals/ModalImportExport';
import { ModalSelectClinic } from 'components/organisms/modals/ModalSelectClinics';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { StackModalViewDocuments } from 'components/organisms/modals/ModalViewDocuments/ModalViewDocuments';
import { ModalViewExam } from 'components/organisms/modals/ModalViewExam/ModalViewExam';
import {
  ModalViewUsers,
  StackModalViewUsers,
} from 'components/organisms/modals/ModalViewUsers/ModalViewUsers';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { NextPage } from 'next';
import { StatusEnum } from 'project/enum/status.enum';

import { SArrowNextIcon } from 'assets/icons/SArrowNextIcon';
import SClinicIcon from 'assets/icons/SClinicIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { useCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { getCompanyName } from 'core/utils/helpers/companyName';

import { SActionButton } from '../../../../components/atoms/SActionButton';

const CompanyPage: NextPage = () => {
  const {
    nextStepMemo,
    actionsStepMemo,
    modulesStepMemo,
    shortActionsStepMemo,
    nextStep,
    company,
    isLoading,
    medicineStepMemo,
    handleUploadRisk,
  } = useCompanyStep();

  useFetchFeedback(isLoading && !company?.id);
  const companyName = getCompanyName(company);

  return (
    <>
      <SHeaderTag hideInitial title={companyName} />

      <SContainer>
        <SPageTitle icon={SClinicIcon}>{companyName}</SPageTitle>
        {nextStepMemo && (
          <>
            <SText mt={20}>Proximo passo</SText>
            <SFlex mt={5} gap={10} flexWrap="wrap">
              {nextStepMemo.map((props) => (
                <SActionButton key={props.text} {...props} />
              ))}
              <SFlex gap={0} align="center">
                {/* <SText fontSize={10}>Pular</SText> */}
                <SIconButton
                  onClick={nextStep}
                  tooltip="Pular para próximo passo"
                  sx={{
                    alignSelf: 'center',
                  }}
                >
                  <Icon
                    component={SArrowNextIcon}
                    sx={{
                      fontSize: '1.2rem',
                    }}
                  />
                </SIconButton>
              </SFlex>
            </SFlex>
          </>
        )}
        <SText mt={20}>Dados da empresa</SText>
        <SFlex mt={5} gap={10} flexWrap="wrap">
          {actionsStepMemo.map((props) => (
            <SActionButton key={props.text} {...props} />
          ))}
        </SFlex>

        <SPageTitleSection title="Segurança" />
        <SFlex mt={5} gap={10} flexWrap="wrap">
          {modulesStepMemo.map((props) => (
            <SActionButton key={props.text} {...props} />
          ))}
        </SFlex>

        <SPageTitleSection title="Medicina" />
        <SFlex mt={5} gap={10} flexWrap="wrap">
          {medicineStepMemo.map((props) => (
            <SActionButton key={props.text} {...props} />
          ))}
        </SFlex>

        <SText mt={20}>Atalhos</SText>
        <SFlex mt={5} gap={10} flexWrap="wrap">
          {shortActionsStepMemo.map((props) => (
            <SActionButton key={props.text} {...props} />
          ))}
        </SFlex>
        <SText mt={20}>Importações</SText>
        <SFlex mt={5} gap={10} flexWrap="wrap">
          <STagButton
            text="Planilha de riscos"
            onClick={handleUploadRisk}
            width={'200px'}
            icon={SUploadIcon}
          />
        </SFlex>

        <WorkspaceTable hideModal />
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
