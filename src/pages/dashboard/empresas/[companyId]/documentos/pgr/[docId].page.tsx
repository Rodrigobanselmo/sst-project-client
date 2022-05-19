import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { RiskGroupDataTable } from 'components/organisms/tables/RiskGroupDataTable ';
import { NextPage } from 'next';

import SDocumentIcon from 'assets/icons/SDocumentIcon';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { DocumentFormPgr } from '../../components/DocumentFormPgr';

const Companies: NextPage = () => {
  return (
    <SContainer>
      <SPageTitle icon={SDocumentIcon}>Documento PGR</SPageTitle>
      <DocumentFormPgr />
      <RiskGroupDataTable />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
