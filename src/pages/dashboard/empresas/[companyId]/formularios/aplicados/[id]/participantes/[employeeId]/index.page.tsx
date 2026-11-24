import dynamic from 'next/dynamic';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
const Page=dynamic(()=>import('@v2/pages/companies/forms/pages/application/pages/clinical/ClinicalDashboardPage').then(m=>m.ClinicalDashboardPage),{ssr:false});
export default Page;
export const getServerSideProps=withSSRAuth(async()=>({props:{}}));
