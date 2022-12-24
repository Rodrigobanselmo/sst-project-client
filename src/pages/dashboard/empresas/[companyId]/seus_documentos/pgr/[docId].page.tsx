import { useCallback } from 'react';

import { SActionButton } from 'components/atoms/SActionButton';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import { ModalAddDocPgr } from 'components/organisms/modals/ModalAddDocPgr';
import {
  initialWorkspaceSelectState,
  ModalSelectWorkspace,
} from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { ModalViewProfessional } from 'components/organisms/modals/ModalViewProfessional';
import { DocTable } from 'components/organisms/tables/DocTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import SActionPlanIcon from 'assets/icons/SActionPlanIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { DocumentPgrForm } from '../../../../../../components/organisms/forms/DocumentPgrForm';

const Companies: NextPage = () => {
  const { query, push } = useRouter();
  const { onOpenModal } = useModal();
  const { data: company } = useQueryCompany();

  const handleGoToRiskData = () => {
    push(
      RoutesEnum.RISK_DATA.replace(
        /:companyId/g,
        query.companyId as string,
      ).replace(/:riskGroupId/g, query.docId as string),
    );
  };

  const handleGoToActionPlan = () => {
    const goTo = (workId: string) => {
      push(
        RoutesEnum.ACTION_PLAN.replace(/:companyId/g, query.companyId as string)
          .replace(/:workspaceId/g, workId)
          .replace(/:riskGroupId/g, query.docId as string),
      );
    };

    onOpenModal(ModalEnum.WORKSPACE_SELECT, {
      title: 'Selecione para qual Estabelecimento deseja ver o plano de ação',
      onSelect: (workspace: IWorkspace) => goTo(workspace.id),
    } as typeof initialWorkspaceSelectState);
  };

  const handleAddCharacterization = useCallback(() => {
    const workspaceLength = company?.workspace?.length || 0;
    const goToEnv = (workId: string) => {
      push({
        pathname: `${RoutesEnum.CHARACTERIZATIONS.replace(
          ':companyId',
          company.id,
        ).replace(':workspaceId', workId)}/${CharacterizationEnum.ALL}`,
      });
    };

    if (workspaceLength != 1) {
      const initialWorkspaceState = {
        title: 'Selecione para qual Estabelecimento deseja adicionar',
        onSelect: (workspace: IWorkspace) => goToEnv(workspace.id),
      } as typeof initialWorkspaceSelectState;

      onOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
    }

    if (!company?.workspace) return;
    if (workspaceLength == 1) goToEnv(company.workspace[0].id);
  }, [company.id, company?.workspace, onOpenModal, push]);

  return (
    <>
      <SHeaderTag title={'PGR'} />
      <SContainer>
        <SPageTitle mb={15} icon={SDocumentIcon}>
          Documento PGR
        </SPageTitle>
        <SPageTitleSection mb={5} mt={15} title="Ações" />
        <SFlex gap={10}>
          <SActionButton
            icon={SPhotoIcon}
            onClick={handleAddCharacterization}
            text={'Caracterização Básica'}
            success
            tooltipText={
              'Cadastro de ambientes de trabalho, atividades e posto de trabalh (adicionar fotografia)'
            }
          />
          <SActionButton
            icon={SRiskFactorIcon}
            onClick={handleGoToRiskData}
            text={'Vincular fatores de risco'}
            primary
          />
        </SFlex>
        <SPageTitleSection title="Gestão" icon={SPhotoIcon} />
        <SActionButton
          mb={15}
          mt={5}
          icon={SActionPlanIcon}
          onClick={handleGoToActionPlan}
          text={'Plano de ação'}
          width={'175px'}
        />

        <DocumentPgrForm mb={15} riskGroupId={query.docId as string} />
        <DocTable riskGroupId={query.docId as string} query={{ isPGR: true }} />
        <ModalAddDocPgr />
        <ModalViewProfessional />
        <ModalSingleInput />
        <ModalSelectWorkspace />
      </SContainer>
    </>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
