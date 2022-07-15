import { useCallback, useMemo } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import SText from 'components/atoms/SText';
import { ModalEditCompany } from 'components/organisms/modals/company/ModalEditCompany';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { ModalSelectCompany } from 'components/organisms/modals/ModalSelectCompany';
import {
  initialDocPgrSelectState,
  ModalSelectDocPgr,
} from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { setGhoOpen, setGhoState } from 'store/reducers/hierarchy/ghoSlice';

import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import { SGhoIcon } from 'assets/icons/SGhoIcon';
import SHierarchyIcon from 'assets/icons/SHierarchyIcon';
import SManagerSystemIcon from 'assets/icons/SManagerSystemIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useModal } from 'core/hooks/useModal';
import { IRiskGroupData } from 'core/interfaces/api/IRiskData';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { SActionButton } from '../../../../components/atoms/SActionButton';

const CompanyPage: NextPage = () => {
  const { data: company, isLoading } = useQueryCompany();
  const { onOpenModal } = useModal();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  useFetchFeedback(isLoading && !company?.id);

  // COMPANY
  const handleEditCompany = useCallback(() => {
    onOpenModal(ModalEnum.COMPANY_EDIT, company);
  }, [company, onOpenModal]);

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
    onOpenModal(ModalEnum.EMPLOYEES_EXCEL_ADD);
  }, [onOpenModal]);

  const handleAddManagerSystem = useCallback(() => {
    if (company.riskGroupCount) {
      push({
        pathname: RoutesEnum.MANAGER_SYSTEM.replace(':companyId', company.id),
      });
    } else {
      onOpenModal(ModalEnum.RISK_GROUP_ADD, {});
    }
  }, [company.id, company.riskGroupCount, onOpenModal, push]);

  // MODULES
  const handleDocPGR = useCallback(() => {
    onOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title: 'Selecione o Sistema de Gestão SST do PGR',
      onSelect: (docPgr: IRiskGroupData) =>
        push(
          RoutesEnum.PGR_DOCUMENT.replace(/:companyId/g, company.id).replace(
            /:riskGroupId/g,
            docPgr.id,
          ),
        ),
    } as Partial<typeof initialDocPgrSelectState>);
  }, [company.id, onOpenModal, push]);

  // SHORT_CUTS
  const handleAddRisk = useCallback(() => {
    onOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual Sistema de Gestão SST deseja adicionar os fatores de risco',
      onSelect: (docPgr: IRiskGroupData) =>
        push(
          RoutesEnum.RISK_DATA.replace(/:companyId/g, company.id).replace(
            /:riskGroupId/g,
            docPgr.id,
          ),
        ),
    } as Partial<typeof initialDocPgrSelectState>);
  }, [company.id, onOpenModal, push]);

  const handleGoHierarchy = useCallback(() => {
    if (company.workspace && company.workspace.length === 0)
      return enqueueSnackbar('Cadastre um estabelecimento antes de continuar', {
        variant: 'warning',
      });

    push(RoutesEnum.HIERARCHY.replace(':companyId', company.id || ''));
    dispatch(setGhoState({ hierarchies: [], data: null }));
    dispatch(setGhoOpen(false));
  }, [company.workspace, company.id, enqueueSnackbar, push, dispatch]);

  const handleGoGho = useCallback(() => {
    if (company.workspace && company.workspace.length === 0)
      return enqueueSnackbar('Cadastre um estabelecimento antes de continuar', {
        variant: 'warning',
      });
    if (!company.hierarchyCount)
      return enqueueSnackbar('Cadastre um cargo antes de continuar', {
        variant: 'warning',
      });

    push(RoutesEnum.HIERARCHY.replace(':companyId', company.id || ''));
    dispatch(setGhoState({ hierarchies: [], data: null }));
    dispatch(setGhoOpen(true));
  }, [
    company.workspace,
    company.hierarchyCount,
    company.id,
    enqueueSnackbar,
    push,
    dispatch,
  ]);

  const handleAddTeam = useCallback(() => {
    push({
      pathname: RoutesEnum.TEAM.replace(':companyId', company.id),
    });
  }, [company.id, push]);

  const actionsStepMemo = useMemo(() => {
    return [
      {
        icon: SCompanyIcon,
        onClick: handleAddWorkspace,
        text: 'Cadastrar Estabelecimentos',
        tooltipText:
          'Estabelecimento é o local onde a empresa realiza suas atividades, podendo estar ser um local próprio ou de terceiros',
      },
      {
        icon: BadgeIcon,
        onClick: handleAddEmployees,
        text: 'Cadastrar Empregados',
        tooltipText:
          'Cadastre os empregados e seus respectivos cargos e setores através da importação de planilha excel ou pelo sistema diretamente ao organograma da empresa',
      },
      {
        icon: STeamIcon,
        onClick: handleAddTeam,
        text: 'Cadastrar Usuários',
        tooltipText:
          'Cadastro dos usuários da empresa que ficaram responsaveis por fazer a gestão através do sistema',
      },
      {
        icon: SEditIcon,
        onClick: handleEditCompany,
        text: 'Editar Dados da Empresa',
      },
    ];
  }, [
    handleAddWorkspace,
    handleAddEmployees,
    handleAddTeam,
    handleEditCompany,
  ]);

  const shortActionsStepMemo = useMemo(() => {
    return [
      {
        icon: SHierarchyIcon,
        onClick: handleGoHierarchy,
        text: 'Organograma',
      },
      {
        icon: SGhoIcon,
        onClick: handleGoGho,
        text: 'Grupos Similar de Exposição',
      },
      {
        icon: SRiskFactorIcon,
        onClick: handleAddRisk,
        text: 'Vincular Fatores de Risco',
      },
    ];
  }, [handleAddRisk, handleGoGho, handleGoHierarchy]);

  const modulesStepMemo = useMemo(() => {
    return [
      {
        icon: SDocumentIcon,
        onClick: handleDocPGR,
        text: 'PGR (Documento)',
        tooltipText:
          'Alimentação de dados para geração de um documento PGR completo',
      },
    ];
  }, [handleDocPGR]);

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

    if (!company.riskGroupCount)
      return {
        icon: SManagerSystemIcon,
        onClick: handleAddManagerSystem,
        text: 'Sistema de Gestão',
        tooltipText:
          'É onde todos os dados para a Gestão SST ficam vinculados e é possível importa-lo em outras empresas. Recomenda-se ter somente um sistema de gestão por empresa',
        sx: { backgroundColor: 'primary.main' },
        primary: true,
      };

    if (!company.homogenousGroupCount)
      return {
        ...shortActionsStepMemo[1],
        sx: { backgroundColor: 'info.main' },
        success: true,
      };

    return {
      ...modulesStepMemo[0],
      sx: { backgroundColor: 'primary.main' },
      success: true,
    };

    return null;
  }, [
    actionsStepMemo,
    company.employeeCount,
    company.homogenousGroupCount,
    company.riskGroupCount,
    company.workspace,
    handleAddManagerSystem,
    modulesStepMemo,
    shortActionsStepMemo,
  ]);

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
      <ModalSelectWorkspace />
      <ModalSelectDocPgr />
      <ModalEditCompany />
      <ModalUploadPhoto />
      <ModalSelectCompany />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
