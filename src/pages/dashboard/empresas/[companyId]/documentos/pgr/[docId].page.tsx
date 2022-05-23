import { SActionButton } from 'components/atoms/SActionButton';
import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { ModalAddDocPgr } from 'components/organisms/modals/ModalAddDocPgr';
import { DocPgrTable } from 'components/organisms/tables/DocPgrTable';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import SDocumentIcon from 'assets/icons/SDocumentIcon';
import SRiskFactorIcon from 'assets/icons/SRiskFactorIcon';

import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { DocumentFormPgr } from '../../components/DocumentFormPgr';

const Companies: NextPage = () => {
  const { query, push } = useRouter();

  const handleGoToRiskData = () => {
    push(
      RoutesEnum.RISK_DATA.replace(
        /:companyId/g,
        query.companyId as string,
      ).replace(/:riskGroupId/g, query.docId as string),
    );
  };

  return (
    <SContainer>
      <SPageTitle mb={15} icon={SDocumentIcon}>
        Documento PGR
      </SPageTitle>
      <SActionButton
        icon={SRiskFactorIcon}
        onClick={handleGoToRiskData}
        text={'Adicionar fatores de risco'}
        primary
        mb={15}
      />

      <DocumentFormPgr mb={15} riskGroupId={query.docId as string} />
      <DocPgrTable riskGroupId={query.docId as string} />
      <ModalAddDocPgr />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
