import { SContainer } from 'components/atoms/SContainer';
import { DatabaseTable } from 'components/tables/DatabaseTable';
import { NextPage } from 'next';

const Database: NextPage = () => {
  return (
    <SContainer>
      <DatabaseTable />
    </SContainer>
  );
};

export default Database;
