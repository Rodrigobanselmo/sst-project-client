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
      riskGroupId: 'daf542d6-0884-452b-9174-7f1ce269b234',
      workspaceId: '44607aea-6320-4950-a3d3-e76d7deb5d74',
      workspaceName: 'Matriz',
      companyId: '1a9feb0b-0daa-4559-9abd-505e50a861a2',
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
