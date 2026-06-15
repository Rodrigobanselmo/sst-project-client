import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SPageTitle from 'components/atoms/SPageTitle';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';
import { RiskEditorFields } from 'components/organisms/modals/ModalAddRisk/components/RiskEditorFields/RiskEditorFields';
import { useAddRisk } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { StackModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useQueryRisk } from 'core/services/hooks/queries/useQueryRisk/useQueryRisk';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskEditPage: NextPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const riskId = router.query.riskId as string;

  // Fetch the risk data using the dedicated endpoint
  const { data: risk, isLoading, isError } = useQueryRisk({ companyId, id: riskId });

  const handleBackToList = () => {
    router.push(RoutesEnum.RISKS.replace(/:companyId/g, companyId));
  };

  const props = useAddRisk({
    initialData: risk as any,
    disableModalClose: true,
    onCancel: handleBackToList,
    riskEditorLayout: 'inline',
  });

  const {
    riskData,
    setRiskData,
    handleSubmit,
    onSubmit,
    onCloseUnsaved,
    loading,
  } = props;

  if (isLoading) {
    return (
      <>
        <SHeaderTag title={'Carregando...'} />
        <SContainer>
          <Box sx={{ px: 5, py: 10 }}>Carregando...</Box>
        </SContainer>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <SHeaderTag title={'Erro ao carregar risco'} />
        <SContainer>
          <Box sx={{ px: 5, py: 10 }}>
            <p>
              Não foi possível carregar o fator de risco. Se a API foi atualizada
              recentemente, confirme que as migrations foram aplicadas com{' '}
              <code>npx prisma migrate deploy</code>.
            </p>
            <SButton variant="outlined" onClick={handleBackToList}>
              Voltar para lista
            </SButton>
          </Box>
        </SContainer>
      </>
    );
  }

  if (!risk) {
    return (
      <>
        <SHeaderTag title={'Risco não encontrado'} />
        <SContainer>
          <Box sx={{ px: 5, py: 10 }}>
            <p>Risco não encontrado</p>
            <SButton variant="outlined" onClick={handleBackToList}>
              Voltar para lista
            </SButton>
          </Box>
        </SContainer>
      </>
    );
  }

  return (
    <>
      <SHeaderTag title={'Editar Fator de Risco'} />
      <SContainer>
        <Box sx={{ px: 5, py: 10 }}>
          <SFlex align="center" gap={4} mb={8}>
            <IconButton
              onClick={handleBackToList}
              sx={{
                color: 'text.primary',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <SPageTitle
              mb={0}
              icon={SRiskFactorIcon}
              subtitle="Edição de fator de risco"
            >
              Editar Fator de Risco
            </SPageTitle>
          </SFlex>
          <Box
            component="form"
            onSubmit={(handleSubmit as any)(onSubmit)}
            sx={{
              mt: 6,
              border: '1px solid',
              borderColor: 'background.divider',
              borderRadius: 2,
              p: 8,
              backgroundColor: 'background.paper',
            }}
          >
            <RiskEditorFields {...props} />

            <SFlex justify="end" mt={10} gap={4}>
              <SButton variant="outlined" size="small" onClick={onCloseUnsaved}>
                Cancelar
              </SButton>
              <SButton
                variant="contained"
                size="small"
                type="submit"
                loading={loading}
                onClick={() => setRiskData({ ...riskData, hasSubmit: true })}
              >
                Salvar
              </SButton>
            </SFlex>
          </Box>
        </Box>
        <StackModalAddRisk />
      </SContainer>
    </>
  );
};

export default RiskEditPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
