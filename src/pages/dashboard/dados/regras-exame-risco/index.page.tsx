import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { featureFlags } from '@v2/constants/feature-flags';
import { ExamRiskRuleListPage } from '@v2/pages/master/exam-risk-rules/ExamRiskRuleListPage';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ExamRiskRulesRoute: NextPage = () => {
  return (
    <SContainer>
      <ExamRiskRuleListPage />
    </SContainer>
  );
};

export default ExamRiskRulesRoute;

export const getServerSideProps = withSSRAuth(
  async () => {
    if (!featureFlags.examRiskRuleLibrary) {
      return {
        redirect: { destination: RoutesEnum.DATABASE, permanent: false },
      };
    }

    return { props: {} };
  },
  {
    roles: [RoleEnum.MASTER],
  },
);
