import { SContainer } from 'components/atoms/SContainer';
import { DatabaseTable } from 'components/organisms/tables/DatabaseTable';
import { NextPage } from 'next';

import { useMutUpsertRiskDocsPgr } from 'core/services/hooks/mutations/checklist/useMutUpsertRiskDocsPgr';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Database: NextPage = () => {
  const createDoc = useMutUpsertRiskDocsPgr();

  const onGeneratePGRDocumentTest = () => {
    return createDoc.mutateAsync({
      version: Math.random().toString(),
      name: 'doc_name',
      riskGroupId: '7868bea7-3623-4d48-98c4-0c2c297a79fc',
      workspaceId: '48707b4d-e011-44e2-a4fa-bded0d9efe41',
      workspaceName: 'Matriz',
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
