import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { SActionButton } from 'components/atoms/SActionButton';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SPageTitle from 'components/atoms/SPageTitle';
import SPageTitleSection from 'components/atoms/SPageTitleSection';
import { ModalAddDocINSALUBRIDADEVersion } from 'components/organisms/modals/ModalAddDocVersion/main/ModalAddDocINSALUBRIDADEVersion';
import {
  initialWorkspaceSelectState,
  ModalSelectWorkspace,
} from 'components/organisms/modals/ModalSelectWorkspace';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { ModalViewProfessional } from 'components/organisms/modals/ModalViewProfessional';
import { DocTable } from 'components/organisms/tables/DocTable';
import { NextPage } from 'next';
import { DocumentTypeEnum } from 'project/enum/document.enums';

import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const INSALUBRIDADE: NextPage = () => {
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

  return (
    <>
      <SHeaderTag title={'INSALUBRIDADE'} />
      <SContainer>
        <SPageTitle mb={15} icon={SDocumentIcon}>
          Documento INSALUBRIDADE
        </SPageTitle>
        <SPageTitleSection mb={5} mt={15} title="Ações" />
        <SFlex mb={15} gap={10}>
          <SActionButton
            icon={SRiskFactorIcon}
            onClick={handleGoToRiskData}
            text={'Vincular fatores de risco'}
            primary
          />
        </SFlex>

        <DocTable
          query={{ type: DocumentTypeEnum.INSALUBRIDADE }}
          type={DocumentTypeEnum.INSALUBRIDADE}
        />
        <ModalViewProfessional />
        <ModalSingleInput />
        <ModalSelectWorkspace />
        <ModalAddDocINSALUBRIDADEVersion />
      </SContainer>
    </>
  );
};

export default INSALUBRIDADE;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
