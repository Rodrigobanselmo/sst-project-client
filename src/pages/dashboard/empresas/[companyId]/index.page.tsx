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
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { NextPage } from 'next';

import SCompanyIcon from 'assets/icons/SCompanyIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { SActionButton } from '../../../../components/atoms/SActionButton';

const CompanyPage: NextPage = () => {
  const { data: company } = useQueryCompany();
  const { onOpenModal } = useModal();

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
    console.log(data, isFirstWorkspace, company);
    onOpenModal(ModalEnum.WORKSPACE_ADD, isFirstWorkspace ? data : {});
  }, [company, onOpenModal]);

  const handleAddEmployees = useCallback(() => {
    onOpenModal(ModalEnum.EMPLOYEES_ADD);
  }, [onOpenModal]);

  const handleAddPgrDocument = useCallback(() => {
    if (company.riskGroupCount) {
      onOpenModal(ModalEnum.WORKSPACE_SELECT);
    } else {
      if (company.workspace && company.workspace[0])
        onOpenModal(ModalEnum.RISK_GROUP_ADD, {
          workspaceId: company.workspace[0].id,
          goTo: RoutesEnum.COMPANY_PGR_DOCUMENT.replace(
            ':companyId',
            company.id,
          ).replace(':workspaceId', company.workspace[0].id),
        });
    }
  }, [company.id, company.riskGroupCount, company.workspace, onOpenModal]);

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
        icon: SRiskFactorIcon,
        onClick: handleAddPgrDocument,
        text: 'Documento PGR',
      },
      {
        icon: SEditIcon,
        // onClick: handleAddWorkspace,
        text: 'Editar Dados da Empresa',
      },
    ];
  }, [handleAddEmployees, handleAddWorkspace, handleAddPgrDocument]);

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
      <SFlex mt={5} gap={10}>
        {actionsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>
      <WorkspaceTable hideModal />
      <ModalAddWorkspace />
      <ModalAddEmployees />
      <ModalAddRiskGroup />
      <ModalSelectWorkspace />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
