import { useCallback, useMemo } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SPageTitle from 'components/atoms/SPageTitle';
import SText from 'components/atoms/SText';
import { ModalAddEmployees } from 'components/organisms/modals/ModalAddEmployees';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { WorkplaceTable } from 'components/organisms/tables/WorkplaceTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import SCompanyIcon from 'assets/icons/SCompanyIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
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
    console.log(data, isFirstWorkspace, company);
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

  const actionsStepMemo = useMemo(() => {
    return [
      {
        icon: SCompanyIcon,
        onClick: handleAddWorkspace,
        text: 'Cadastrar Unidades',
      },
      {
        icon: BadgeIcon,
        onClick: handleAddEmployees,
        text: 'Cadastrar Empregados',
      },
      {
        icon: WarningAmberIcon,
        onClick: handleAddPgrDocument,
        text: 'Cadastrar Riscos',
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
      <WorkplaceTable />
      <ModalAddWorkspace />
      <ModalAddEmployees />
      <ModalAddRiskGroup />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
