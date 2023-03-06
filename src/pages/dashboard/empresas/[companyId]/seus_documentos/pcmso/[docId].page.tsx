import { useCallback } from 'react';

import { SActionButton } from 'components/atoms/SActionButton';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { ModalViewExam } from 'components/organisms/modals/ModalViewExam/ModalViewExam';
import { ModalViewProfessional } from 'components/organisms/modals/ModalViewProfessional';
import { DocTable } from 'components/organisms/tables/DocTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import SDocumentIcon from 'assets/icons/SDocumentIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const PCMSO: NextPage = () => {
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

  const handleAddExam = useCallback(() => {
    onOpenModal(ModalEnum.EXAM_RISK_VIEW);
  }, [onOpenModal]);

  return (
    <>
      <SHeaderTag title={'PCMSO'} />
      <SContainer>
        <SPageTitle mb={15} icon={SDocumentIcon}>
          Documento PCMSO
        </SPageTitle>
        <SPageTitleSection mb={5} mt={15} title="Ações" />
        <SFlex mb={15} gap={10}>
          <SActionButton
            icon={SExamIcon}
            onClick={handleAddExam}
            text={'Exames'}
            width={'175px'}
            primary
            sx={{ backgroundColor: 'info.main' }}
            tooltipText={'Vincular exames aos fatores de risco'}
          />
          <SActionButton
            icon={SRiskFactorIcon}
            onClick={handleGoToRiskData}
            text={'Vincular fatores de risco'}
            primary
          />
        </SFlex>
        {/* <SPageTitleSection title="Gestão" icon={SPhotoIcon} />
      <SActionButton
        mb={15}
        mt={5}
        icon={SActionPlanIcon}
        onClick={handleAddExam}
        text={'Exames'}
        width={'175px'}
      /> */}

        <DocTable
          documentPcmsoId={query.docId as string}
          query={{ type: DocumentTypeEnum.PGR }}
        />
        <ModalViewProfessional />
        <ModalSingleInput />
        <ModalSelectWorkspace />
        <ModalViewExam />
      </SContainer>
    </>
  );
};

export default PCMSO;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
