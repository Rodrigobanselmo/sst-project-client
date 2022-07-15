import { useCallback, useMemo } from 'react';

import { SActionButton } from 'components/atoms/SActionButton';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import { ModalAddDocPgr } from 'components/organisms/modals/ModalAddDocPgr';
import { ModalSelectProfessional } from 'components/organisms/modals/ModalSelectProfessional';
import {
  initialWorkspaceSelectState,
  ModalSelectWorkspace,
} from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { DocPgrTable } from 'components/organisms/tables/DocPgrTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import SCharacterization from 'assets/icons/SCharacterizationIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';
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

  const handleAddEnvironments = useCallback(() => {
    const workspaceLength = company?.workspace?.length || 0;
    const goToEnv = (workId: string) => {
      push({
        pathname: `${RoutesEnum.CHARACTERIZATIONS.replace(
          ':companyId',
          company.id,
        ).replace(':workspaceId', workId)}/${CharacterizationEnum.ENVIRONMENT}`,
      });
    };

    if (workspaceLength != 1) {
      const initialWorkspaceState = {
        title:
          'Selecione para qual Estabelecimento deseja adicionar os ambientes de trabalho',
        onSelect: (workspace: IWorkspace) => goToEnv(workspace.id),
      } as typeof initialWorkspaceSelectState;

      onOpenModal(ModalEnum.WORKSPACE_SELECT, initialWorkspaceState);
    }

    if (!company?.workspace) return;
    if (workspaceLength == 1) goToEnv(company.workspace[0].id);
  }, [company.id, company?.workspace, onOpenModal, push]);

  const handleAddCharacterization = useCallback(() => {
    const workspaceLength = company?.workspace?.length || 0;
    const goToEnv = (workId: string) => {
      push({
        pathname: `${RoutesEnum.CHARACTERIZATIONS.replace(
          ':companyId',
          company.id,
        ).replace(':workspaceId', workId)}/${CharacterizationEnum.LABOR}`,
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

  const characterizationStepMemo = useMemo(() => {
    return [
      {
        icon: SEnvironmentIcon,
        onClick: handleAddEnvironments,
        text: 'Ambientes de trabalho (foto)',
        tooltipText:
          'Cadastro de ambientes de trabalho e os riscos atrelado a eles (adicionar fotografia do ambiente)',
      },
      {
        icon: SCharacterization,
        onClick: handleAddCharacterization,
        text: 'Mão de obra (foto)',
        tooltipText:
          'Cadastro das atividades, posto de trabalho e equipamentos da mão de obra e os riscos atrelado (adicionar fotografia)',
      },
    ];
  }, [handleAddEnvironments, handleAddCharacterization]);

  return (
    <SContainer>
      <SPageTitle mb={15} icon={SDocumentIcon}>
        Documento PGR
      </SPageTitle>
      <SPageTitleSection mb={5} mt={15} title="Fatores de Risco e Perigos" />
      <SActionButton
        icon={SRiskFactorIcon}
        onClick={handleGoToRiskData}
        text={'Vincular fatores de risco'}
        primary
      />
      <SPageTitleSection title="Caracterização Básica" icon={SPhotoIcon} />
      <SFlex mb={15} mt={5} gap={10} flexWrap="wrap">
        {characterizationStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>

      <DocumentPgrForm mb={15} riskGroupId={query.docId as string} />
      <DocPgrTable riskGroupId={query.docId as string} />
      <ModalAddDocPgr />
      <ModalSelectProfessional />
      <ModalSingleInput />
      <ModalSelectWorkspace />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
