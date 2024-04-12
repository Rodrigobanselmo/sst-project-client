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
      riskGroupId: 'what so ever',
      // riskGroupId: '929311d9-5f6c-4773-b071-58af8285beff', // Amilfi
      // workspaceId: 'f588207b-ac7b-4b63-9d85-cd5753f9b288', // Amilfi
      // companyId: 'd1309cad-19d4-4102-9bf9-231f91095c20', // Amilfi
      // documentDataId: '0de725ee-7ee0-43a1-8924-af0f31a8eb42', // Amilf

      // riskGroupId: '7987a2a8-6c43-430d-bca9-b8c070f9f9dd', // Clinica Leandro
      // workspaceId: 'cf9e63eb-7405-44b2-a245-f013c505948d', // Clinica Leandro
      // companyId: 'bff1cbc6-347a-4539-b677-43e415d50f7e', // Clinica Leandro
      // documentDataId: 'ebc15805-d3e6-4083-8cad-6bc15e43b4e5', // Clinica Leandro

      workspaceId: 'bad1655c-b8eb-4924-ba32-260ecf6da769', // RBA
      companyId: '96495589-43f4-493a-b065-e41fd2561153', // RBA
      documentDataId: '74718c72-0501-4605-875c-98dec66fd11d', // RBA

      // riskGroupId: '9579bdb8-fa4f-4659-aa58-c11bf023ea6a', // JAN ARua DP
      // workspaceId: 'd2319c30-5c95-4284-bb9e-847957b72abb', // JAN ARua DP
      // companyId: '8bbaf541-6066-49e8-82b9-5cd4193f2b35', // JAN ARua DP
      // documentDataId: '57e03e59-43c7-4cee-8d62-1a25c6e11d63', // JAN ARua DP

      // riskGroupId: '9579bdb8-fa4f-4659-aa58-c11bf023ea6a', // DIDIO PCMSO
      // workspaceId: 'e7bda7a3-15a8-4276-8b5c-4dcbf3a8fee1', // DIDIO PCMSO
      // companyId: '9b078ac2-99f2-44d6-968e-8d8860df4d81', // DIDIO PCMSO
      // documentDataId: 'ab9484ef-d0a7-4b02-b56b-cb73b9617a38', // DIDIO PCMSO

      // workspaceId: '7522c956-02c3-48ef-a788-faf6aff21774', // BARRA MANSA PCMSO
      // companyId: '87544c8e-8827-4429-a3d6-ec62f486fc5b', // BARRA MANSA PCMSO
      // documentDataId: 'f8820305-083e-44f4-bc9b-b922aa804850', // BARRA MANSA PCMSO

      // companyId: '4a48bc0d-017b-4a6a-a3b1-4e14afc49b0b', //UNI DONTO PCMSO
      // workspaceId: '5c61f808-9b72-44bc-a4e0-f57e409c247c', //UNI DONTO PCMSO
      // documentDataId: '8ca2c7ed-365c-42d9-afc2-eeea56f39359', //UNI DONTO PCMSO

      // companyId: '6a90957b-ea2a-4dba-b88e-ee128562718a', //Resende PCMSO
      // workspaceId: 'cf7a27ed-476f-4b63-85ec-606e7575d5c1', //Resende PCMSO
      // documentDataId: '3537e817-ccdf-4d9e-bb36-93383d3e6c60', //Resende PCMSO

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

      // riskGroupId: '087fa53c-38aa-4f7e-8904-db557c3cac4b', // AMBM
      // workspaceId: '7522c956-02c3-48ef-a788-faf6aff21774', // AMBM
      // companyId: '87544c8e-8827-4429-a3d6-ec62f486fc5b', // AMBM
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
