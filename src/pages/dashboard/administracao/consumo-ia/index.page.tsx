import { SContainer } from 'components/atoms/SContainer';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { RoleEnum } from 'project/enum/roles.enums';
import { AiConsumptionPage } from '@v2/features/ai-accounting/AiConsumptionPage';

export default function AiConsumptionRoute() {
  return (
    <SContainer>
      <AiConsumptionPage />
    </SContainer>
  );
}
export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
