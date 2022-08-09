import { SContainer } from 'components/atoms/SContainer';
import { DatabaseTable } from 'components/organisms/tables/DatabaseTable';
import { NextPage } from 'next';

import { useMutUpsertRiskDocsPgr } from 'core/services/hooks/mutations/checklist/docs/useMutCreateDocsPgr';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Database: NextPage = () => {
  const createDoc = useMutUpsertRiskDocsPgr();

  const onGeneratePGRDocumentTest = () => {
    //teste download doc //3556725
    return createDoc.mutateAsync({
      version: '0.0.1',
      name: 'AAA',
      description: 'AAA',
      workspaceName: 'Matriz',
      riskGroupId: '929311d9-5f6c-4773-b071-58af8285beff', // Amilfi
      workspaceId: 'f588207b-ac7b-4b63-9d85-cd5753f9b288', // Amilfi
      companyId: 'd1309cad-19d4-4102-9bf9-231f91095c20', // Amilfi
      // riskGroupId: '06d40eac-254b-4f47-8a05-309fbfcdea11', // Video Aula RB ANSELmo simplesst
      // workspaceId: 'a942957a-bf2a-40e4-ac9d-dd4976a4b79c', // Video Aula RB ANSELmo simplesst
      // companyId: '3af70a3f-be5b-4cda-95f5-a4d469349ca4', // Video Aula RB ANSELmo simplesst
      // riskGroupId: '55863d43-d4ef-4349-942a-475b9647d87b', // MARCELO ACADEMIA
      // workspaceId: '0b1f5cd4-9cfe-4aa5-9d7b-786dbf0c4d8e', // MARCELO ACADEMIA
      // companyId: '2970d2a8-1c39-49b7-a805-2a4aaca7c6a9', // MARCELO ACADEMIA
      // riskGroupId: '4ae39b70-1921-4aa7-9022-213bf761c43b', // AAA
      // workspaceId: 'fdc8ee46-ab81-46d4-bd56-1afdeff11046', // AAA
      // companyId: 'd7bb9cb3-2e96-4761-bc94-8aaabae20a3d', // AAA
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
