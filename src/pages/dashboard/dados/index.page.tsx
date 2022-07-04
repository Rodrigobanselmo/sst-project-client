import { SContainer } from 'components/atoms/SContainer';
import { DatabaseTable } from 'components/organisms/tables/DatabaseTable';
import { NextPage } from 'next';

import { useMutUpsertRiskDocsPgr } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskDocsPgr';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Database: NextPage = () => {
  const createDoc = useMutUpsertRiskDocsPgr();

  const onGeneratePGRDocumentTest = () => {
    return createDoc.mutateAsync({
      version: '4.1',
      name: 'doc_name',
      description: 'doc_description',
      riskGroupId: '17ab1023-c2b2-44f0-a433-468721c85e40',
      workspaceId: '7be12d4d-942c-4f45-b3fb-03dadeb89c50',
      workspaceName: 'Matriz',
      companyId: '24390684-afbf-4713-8188-a27f2bdf0d68',
    });
  };

  return (
    <SContainer>
      <DatabaseTable />
      <button onClick={onGeneratePGRDocumentTest}>documento PGR teste</button>
    </SContainer>
  );
};

export default Database;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
