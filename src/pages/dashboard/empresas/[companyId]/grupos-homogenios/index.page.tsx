import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { StackModalAddGho } from 'components/organisms/modals/ModalAddGHO';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalSelectGho } from 'components/organisms/modals/ModalSelectGho';
import { ModalSelectWorkspace } from 'components/organisms/modals/ModalSelectWorkspace';
import { GhosTable } from 'components/organisms/tables/GhosTable/GhosTable';
import { NextPage } from 'next';

import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
  const { workspaceId } = useTabWorkspaceId();

  return (
    <>
      <SHeaderTag title={'GSE'} />
      <SContainer>
        <GhosTable workspaceId={workspaceId} />
        <StackModalAddGho />
        <ModalSelectGho />
        <ModalSelectWorkspace />
        <ModalSelectDocPgr />
      </SContainer>
    </>
  );
};

export default RiskPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
