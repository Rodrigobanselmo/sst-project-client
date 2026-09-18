import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { RiskMatrixEditorPage } from '@v2/pages/companies/risk-matrices/risk-matrix-editor.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskMatrixEditorRoutePage: NextPage = () => {
  const { query } = useRouter();
  const companyId = String(query.companyId || '');
  const matrixId = String(query.matrixId || '');
  const versionId = String(query.versionId || '');

  return (
    <>
      <SHeaderTag title="Editor de Matriz de Risco" />
      <SContainer>
        <RiskMatrixEditorPage
          companyId={companyId}
          matrixId={matrixId}
          versionId={versionId}
        />
      </SContainer>
    </>
  );
};

export default RiskMatrixEditorRoutePage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
