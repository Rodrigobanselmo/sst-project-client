import { useCallback, useMemo } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SPageTitle from 'components/atoms/SPageTitle';
import SText from 'components/atoms/SText';
import { ModalAddEmployees } from 'components/organisms/modals/ModalAddEmployees';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import {
  initialWorkspaceSelectState,
  ModalSelectWorkspace,
} from 'components/organisms/modals/ModalSelectWorkspace';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { SActionButton } from '../../../../components/atoms/SActionButton';

const CompanyPage: NextPage = () => {
  const { data: company } = useQueryCompany();
  const { onOpenModal } = useModal();
  const { push } = useRouter();

  const handleAddWorkspace = useCallback(() => {
    const data: Partial<typeof initialWorkspaceState> = {
      name: company.type,
      cep: company?.address?.cep,
      number: company?.address?.number,
      city: company?.address?.city,
      complement: company?.address?.complement,
      state: company?.address?.state,
      street: company?.address?.street,
      neighborhood: company?.address?.neighborhood,
    };

    const isFirstWorkspace = company.workspace && company.workspace.length == 0;
    onOpenModal(ModalEnum.WORKSPACE_ADD, isFirstWorkspace ? data : {});
  }, [company, onOpenModal]);

  const handleAddEmployees = useCallback(() => {
    onOpenModal(ModalEnum.EMPLOYEES_ADD);
  }, [onOpenModal]);

  const handleAddPgrDocument = useCallback(() => {
    if (company.riskGroupCount) {
      push({
        pathname: RoutesEnum.COMPANY_PGR.replace(':companyId', company.id),
      });
    } else {
      onOpenModal(ModalEnum.RISK_GROUP_ADD, {
        goTo: RoutesEnum.COMPANY_PGR_DOCUMENT.replace(':companyId', company.id),
      });
    }
  }, [company.id, company.riskGroupCount, onOpenModal, push]);

  const handleAddRisk = useCallback(() => {
    onOpenModal(ModalEnum.DOC_PGR_SELECT);
  }, [onOpenModal]);

  const handleAddEnvironments = useCallback(() => {
    const workspaceLength = company?.workspace?.length || 0;
    const goToEnv = (workId: string) => {
      push({
        pathname: RoutesEnum.ENVIRONMENTS.replace(
          ':companyId',
          company.id,
        ).replace(':workspaceId', workId),
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

  const actionsStepMemo = useMemo(() => {
    return [
      {
        icon: SCompanyIcon,
        onClick: handleAddWorkspace,
        text: 'Cadastrar Estabelecimentos',
      },
      {
        icon: BadgeIcon,
        onClick: handleAddEmployees,
        text: 'Cadastrar Empregados',
      },
      {
        icon: SDocumentIcon,
        onClick: handleAddPgrDocument,
        text: 'Documento PGR',
      },
      {
        icon: SRiskFactorIcon,
        onClick: handleAddRisk,
        text: 'Vincular Fatores de Risco',
      },
      {
        icon: SEnvironmentIcon,
        onClick: handleAddEnvironments,
        text: 'Cadastar Ambientes de trabalho',
      },
      {
        icon: SEditIcon,
        // onClick: handleAddWorkspace,
        text: 'Editar Dados da Empresa',
      },
    ];
  }, [
    handleAddWorkspace,
    handleAddEmployees,
    handleAddPgrDocument,
    handleAddRisk,
    handleAddEnvironments,
  ]);

  const nextStepMemo = useMemo(() => {
    if (company.workspace && company.workspace.length == 0)
      return {
        ...actionsStepMemo[0],
        active: true,
      };

    if (!company.employeeCount)
      return {
        ...actionsStepMemo[1],
        sx: { backgroundColor: 'success.main' },
        success: true,
      };

    if (company.employeeCount)
      return {
        ...actionsStepMemo[2],
        sx: { backgroundColor: 'primary.main' },
        primary: true,
      };

    return null;
  }, [actionsStepMemo, company.employeeCount, company.workspace]);

  return (
    <SContainer>
      <SPageTitle icon={BusinessTwoToneIcon}>{company.name}</SPageTitle>
      {nextStepMemo && (
        <>
          <SText mt={20}>Proximo passo</SText>
          <SFlex mt={5}>
            <SActionButton {...nextStepMemo} />
          </SFlex>
        </>
      )}
      <SText mt={20}>Ações</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {actionsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>
      <WorkspaceTable hideModal />
      <ModalAddWorkspace />
      <ModalAddEmployees />
      <ModalAddRiskGroup />
      <ModalSelectWorkspace />
      <ModalSelectDocPgr
        title="Selecione para qual documento PGR deseja adicionar os fatores de risco"
        onSelect={(docPgr) =>
          push(
            RoutesEnum.RISK_DATA.replace(/:companyId/g, company.id).replace(
              /:riskGroupId/g,
              docPgr.id,
            ),
          )
        }
      />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
