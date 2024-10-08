import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { PieGraph } from 'components/molecules/graphs/pie/PieGraph';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { ModalImportExport } from 'components/organisms/modals/ModalImportExport';
import { EmployeesTable } from 'components/organisms/tables/EmployeesTable/EmployeesTable';
import { HistoryScheduleExamClinicTable } from 'components/organisms/tables/HistoryScheduleExamClinicTable/HistoryScheduleExamClinicTable';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { PermissionEnum } from 'project/enum/permission.enum';

import defaultTheme from 'configs/theme';

import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryDashboard } from 'core/services/hooks/queries/useQueryDashboard';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { CompaniesWizard } from './empresas/index.page';

const Home: NextPage = () => {
  const { data: company } = useQueryCompany();
  const { data } = useQueryDashboard();

  const examReport = data?.dailyReport?.exam;

  return (
    <SContainer>
      {/* <SAuthShow hideIf={company.isClinic}>
        <SPageTitle>Site em desenvolvimento</SPageTitle>
        <p>Novas atualizações em breve</p>
      </SAuthShow> */}
      <SAuthShow permissions={[PermissionEnum.COMPANY_SCHEDULE]}>
        <PieGraph
          dataset={[
            {
              borderColor: defaultTheme.palette.graph.red,
              color: defaultTheme.palette.graph.redHover,
              label: 'Vencidos',
              data: examReport?.expired || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.orange,
              color: defaultTheme.palette.graph.orangeHover,
              label: 'Venc. < 45 dias',
              data: examReport?.expiredClose1 || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.darkGreen,
              color: defaultTheme.palette.graph.darkGreenHover,
              label: 'Venc. < 3 meses',
              data: examReport?.expiredClose2 || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.green,
              color: defaultTheme.palette.graph.greenHover,
              label: 'Em Dia',
              data: examReport?.good || 0,
            },
            {
              borderColor: defaultTheme.palette.graph.blue,
              color: defaultTheme.palette.graph.blueHover,
              label: 'Agendados',
              data: examReport?.schedule || 0,
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

      <SAuthShow hideIf={!company.isConsulting}>
        <Box mt={20}>
          <CompaniesWizard />
        </Box>
      </SAuthShow>

      <SAuthShow hideIf={!company.isClinic}>
        <Box mt={20}>
          <HistoryScheduleExamClinicTable />
        </Box>
      </SAuthShow>

      <SAuthShow hideIf={company.isClinic || company.isConsulting}>
        <Box mt={20}>
          <EmployeesTable query={{ all: true }} />
        </Box>
      </SAuthShow>
      <ModalImportExport />
    </SContainer>
  );
};

export default Home;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
