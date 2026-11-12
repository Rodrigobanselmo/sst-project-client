import { HoMonitoringPage } from '@v2/pages/companies/ho-monitoring/ho-monitoring.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

export default HoMonitoringPage;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }));
