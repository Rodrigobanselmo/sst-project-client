import React, { useMemo } from 'react';

import { RiskToolV2 } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/RiskTool';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { SHeader } from '@v2/components/atoms/SHeader/SHeader';
import { SContainer } from '@v2/components/atoms/SContainer/SContainer';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { CircularProgress, Box } from '@mui/material';

const CaracterizacaoPage: NextPage = () => {
  const { data: riskGroupData, isLoading } = useQueryRiskGroupData();

  const riskGroupId = useMemo(() => {
    if (!riskGroupData || riskGroupData.length === 0) return undefined;
    // Get the most recent risk group (last item in the array)
    return riskGroupData[riskGroupData.length - 1]?.id;
  }, [riskGroupData]);

  return (
    <>
      <SHeader title={'Caracterização'} />
      <SContainer>
        {isLoading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        )}
        {!isLoading && riskGroupId && <RiskToolV2 riskGroupId={riskGroupId} />}
        {!isLoading && !riskGroupId && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <p>Nenhum grupo de risco encontrado</p>
          </Box>
        )}
      </SContainer>
    </>
  );
};

export default CaracterizacaoPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
