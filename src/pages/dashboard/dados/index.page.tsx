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
      version: '4.1',
      name: 'doc_name',
      description: 'doc_description',
      // riskGroupId: '929311d9-5f6c-4773-b071-58af8285beff',
      // riskGroupId: '17ab1023-c2b2-44f0-a433-468721c85e40',
      riskGroupId: 'd01765a7-6589-476b-87f1-2b3379d1e2b5',
      // workspaceId: 'f588207b-ac7b-4b63-9d85-cd5753f9b288',
      // workspaceId: '7be12d4d-942c-4f45-b3fb-03dadeb89c50',
      workspaceId: 'b993a972-8f2f-41f3-b879-0f8e61ed5868',
      workspaceName: 'Matriz',
      // companyId: 'd1309cad-19d4-4102-9bf9-231f91095c20',
      // companyId: '24390684-afbf-4713-8188-a27f2bdf0d68',
      companyId: '9b05623f-cf9b-476d-bd8e-136a6fc7cdd1',
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
