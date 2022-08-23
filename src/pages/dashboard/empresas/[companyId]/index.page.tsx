import { Icon } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import SText from 'components/atoms/SText';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { ModalSelectClinic } from 'components/organisms/modals/ModalSelectClinics';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { NextPage } from 'next';

import { SArrowNextIcon } from 'assets/icons/SArrowNextIcon';
import SClinicIcon from 'assets/icons/SClinicIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';

import { useCompanyStep } from 'core/hooks/action-steps/useCompanyStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

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
  } = useCompanyStep();

  useFetchFeedback(isLoading && !company?.id);

  return (
    <SContainer>
      <SPageTitle icon={SClinicIcon}>{company.name}</SPageTitle>
      {nextStepMemo && (
        <>
          <SText mt={20}>Proximo passo</SText>
          <SFlex mt={5} gap={10} flexWrap="wrap">
            {nextStepMemo.map((props) => (
              <SActionButton key={props.text} {...props} />
            ))}
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
        </>
      )}
      <SText mt={20}>Dados da empresa</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {actionsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>

      <SPageTitleSection title="Modulos" icon={SPhotoIcon} />
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {modulesStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>

      <SPageTitleSection title="Medicina" icon={SPhotoIcon} />
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
      <WorkspaceTable hideModal />
      <ModalAddWorkspace />
      <ModalAddExcelEmployees />
      <ModalAddRiskGroup />
      <ModalShowHierarchyTree />
      <ModalSelectWorkspace />
      <ModalSelectDocPgr />
      <ModalSelectClinic />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
