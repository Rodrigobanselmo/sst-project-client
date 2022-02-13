import { SContainer } from 'components/atoms/SContainer';
import { ChecklistTable } from 'components/tables/ChecklistTable';
import { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <SContainer>
      <ChecklistTable />
    </SContainer>
  );
};

export default Home;
