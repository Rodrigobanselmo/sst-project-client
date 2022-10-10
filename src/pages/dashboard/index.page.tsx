import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { HistoryScheduleExamClinicTable } from 'components/organisms/tables/HistoryScheduleExamClinicTable/HistoryScheduleExamClinicTable';
import { NextPage } from 'next';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Home: NextPage = () => {
  const { data: company } = useQueryCompany();

  return (
    <SContainer>
      <SAuthShow hideIf={company.isClinic}>
        <SPageTitle>Site em desenvolvimento</SPageTitle>
        <p>Novas atualizações em breve</p>
      </SAuthShow>

      <SAuthShow hideIf={!company.isClinic}>
        <HistoryScheduleExamClinicTable />
      </SAuthShow>
    </SContainer>
  );
};

export default Home;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
