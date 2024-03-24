import { Box } from '@mui/material';
import { SActionButton } from 'components/atoms/SActionButton';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import { ModalAddDocPGRVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocPGRVersion';
import { ModalEditDocumentModelData } from 'components/organisms/modals/ModalEditDocumentModel/ModalEditDocumentModel';
import {
  initialWorkspaceSelectState,
  ModalSelectWorkspace,
} from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import {
  initialDocumentModelsViewState,
  StackModalViewDocumentModels,
} from 'components/organisms/modals/ModalViewDocumentModels/ModalViewDocumentModels';
import { ModalViewProfessional } from 'components/organisms/modals/ModalViewProfessional';
import { DocTable } from 'components/organisms/tables/DocTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import SActionPlanIcon from 'assets/icons/SActionPlanIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SPhotoIcon from 'assets/icons/SPhotoIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { usePushRoute } from 'core/hooks/actions-push/usePushRoute';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Companies: NextPage = () => {
  const { query, push } = useRouter();
  const { onOpenModal } = useModal();

  const { handleAddCharacterization } = usePushRoute();

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

  const handleEditDocumentModel = () => {
    onOpenModal(ModalEnum.DOCUMENTS_MODEL_VIEW, {
      companyId: query.companyId,
      title: 'Modelo Documento PGR',
      query: {
        type: DocumentTypeEnum.PGR,
        companyId: query.companyId,
      },
    } as typeof initialDocumentModelsViewState);
  };

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
            active
            icon={SPhotoIcon}
            onClick={handleAddCharacterization}
            text={'Caracterização do Ambiente'}
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
          <SActionButton
            icon={SDocumentIcon}
            onClick={handleEditDocumentModel}
            text={'Modelo PGR'}
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

        <Box mt={30}>
          <DocTable
            query={{ type: DocumentTypeEnum.PGR }}
            type={DocumentTypeEnum.PGR}
          />
        </Box>
        <ModalAddDocPGRVersion />
        <ModalViewProfessional />
        <ModalSingleInput />
        <ModalSelectWorkspace />
        <ModalEditDocumentModelData />
        <StackModalViewDocumentModels />
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
