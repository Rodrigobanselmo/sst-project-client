import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { PieGraph } from 'components/molecules/graphs/pie/PieGraph';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { HistoryScheduleExamClinicTable } from 'components/organisms/tables/HistoryScheduleExamClinicTable/HistoryScheduleExamClinicTable';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { PermissionEnum } from 'project/enum/permission.enum';

import defaultTheme from 'configs/theme';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryDashboard } from 'core/services/hooks/queries/useQueryDashboard';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const DraftEditor = dynamic(
  async () => {
    const mod = await import(
      'components/molecules/form/draft-editor/DraftEditor'
    );
    return mod.DraftEditor;
  },
  { ssr: false },
);

const Home: NextPage = () => {
  const { data: company } = useQueryCompany();
  const { data } = useQueryDashboard();

  const examReport = data?.dailyReport?.exam;

  return (
    <SContainer>
      <DraftEditor
        size="xs"
        mt={5}
        isJson
        label="Orservações"
        placeholder="descrição..."
        onChange={(value) => {
          console.log(JSON.parse(value));
        }}
      />
      {/* <SAuthShow hideIf={company.isClinic}>
        <SPageTitle>Site em desenvolvimento</SPageTitle>
        <p>Novas atualizações em breve</p>
      </SAuthShow> */}
      <SAuthShow permissions={[PermissionEnum.COMPANY_SCHEDULE]}>
        <PieGraph
          dataset={[
            {
              borderColor: defaultTheme.palette.graph.blue,
              color: defaultTheme.palette.graph.blueHover,
              label: 'Agendados',
              data: examReport?.schedule || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.green,
              color: defaultTheme.palette.graph.greenHover,
              label: 'Em Dia',
              data: examReport?.good || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.darkGreen,
              color: defaultTheme.palette.graph.darkGreenHover,
              label: 'Vencimento < 3 meses',
              data: examReport?.expired90 || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.orange,
              color: defaultTheme.palette.graph.orangeHover,
              label: 'Vencimento < 1 meses',
              data: examReport?.expired30 || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.red,
              color: defaultTheme.palette.graph.redHover,
              label: 'Vencidos',
              data: examReport?.expired || 0,
            },
          ]}
          // maxWidth={300}
          data={{
            datasets: [
              {
                borderRadius: 2,
                data: [],
                borderWidth: 1,
              },
            ],
          }}
        />
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
