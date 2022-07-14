import { useCallback, useMemo } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { Icon } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SPageTitle from 'components/atoms/SPageTitle';
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
import {
  initialWorkspaceSelectState,
  ModalSelectWorkspace,
} from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { WorkspaceTable } from 'components/organisms/tables/WorkspaceTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import { setGhoOpen, setGhoState } from 'store/reducers/hierarchy/ghoSlice';

import SCharacterization from 'assets/icons/SCharacterizationIcon';
import SCompanyIcon from 'assets/icons/SCompanyIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SEnvironmentIcon from 'assets/icons/SEnvironmentIcon';
import { SGhoIcon } from 'assets/icons/SGhoIcon';
import SHierarchyIcon from 'assets/icons/SHierarchyIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';
import STeamIcon from 'assets/icons/STeamIcon';

import { CharacterizationEnum } from 'core/enums/characterization.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useModal } from 'core/hooks/useModal';
import { IWorkspace } from 'core/interfaces/api/ICompany';
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
    onOpenModal(ModalEnum.DOC_PGR_SELECT, {
      title:
        'Selecione para qual documento PGR deseja adicionar os fatores de risco',
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
    if (company.hierarchyCount)
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
        icon: STeamIcon,
        onClick: handleAddTeam,
        text: 'Cadastrar Usuários',
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
    handleAddPgrDocument,
    handleAddTeam,
    handleEditCompany,
  ]);

  const shortActionsStepMemo = useMemo(() => {
    return [
      {
        icon: SRiskFactorIcon,
        onClick: handleAddRisk,
        text: 'Vincular Fatores de Risco',
      },
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
    ];
  }, [handleAddRisk, handleGoHierarchy]);

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

      <SFlex align="center" mt={20}>
        <SText mr={3}>Caracterização Básica</SText>
        <Icon
          sx={{ color: 'grey.600', fontSize: '18px' }}
          component={SPhotoIcon}
        />
      </SFlex>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {characterizationStepMemo.map((props) => (
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
