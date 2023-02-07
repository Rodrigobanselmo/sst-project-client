import { SContainer } from 'components/atoms/SContainer';
import { DatabaseTable } from 'components/organisms/tables/DatabaseTable';
import { NextPage } from 'next';

import { useMutUpsertRiskDocsPgr } from 'core/services/hooks/mutations/checklist/docsPGR/useMutCreateDocsPgr';
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
      // riskGroupId: '929311d9-5f6c-4773-b071-58af8285beff', // Amilfi
      // workspaceId: 'f588207b-ac7b-4b63-9d85-cd5753f9b288', // Amilfi
      // companyId: 'd1309cad-19d4-4102-9bf9-231f91095c20', // Amilfi
      // riskGroupId: 'aa9cd6bc-a428-4595-a422-f994bc3a01ca', // marjan
      // workspaceId: '2387c37c-9676-4c99-9001-dda5da3b5d93', // marjan
      // companyId: '8284b538-74d9-429f-8ac4-5a11d26057ad', // marjan
      // riskGroupId: '06d40eac-254b-4f47-8a05-309fbfcdea11', // Video Aula RB ANSELmo simplesst
      // workspaceId: 'a942957a-bf2a-40e4-ac9d-dd4976a4b79c', // Video Aula RB ANSELmo simplesst
      // companyId: '3af70a3f-be5b-4cda-95f5-a4d469349ca4', // Video Aula RB ANSELmo simplesst
      // riskGroupId: '55863d43-d4ef-4349-942a-475b9647d87b', // MARCELO ACADEMIA
      // workspaceId: '0b1f5cd4-9cfe-4aa5-9d7b-786dbf0c4d8e', // MARCELO ACADEMIA
      // companyId: '2970d2a8-1c39-49b7-a805-2a4aaca7c6a9', // MARCELO ACADEMIA
      // riskGroupId: 'a481c3f1-ab3f-4f0d-8903-a2cd4b71d96f', // ACM8
      // workspaceId: 'e4f36a46-392b-47d5-93ba-10956715e289', // ACM8
      // companyId: '9eedc566-065d-4662-a151-2596ba94dcb4', // ACM8
      riskGroupId: '087fa53c-38aa-4f7e-8904-db557c3cac4b', // AMBM
      workspaceId: '7522c956-02c3-48ef-a788-faf6aff21774', // AMBM
      companyId: '87544c8e-8827-4429-a3d6-ec62f486fc5b', // AMBM
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
