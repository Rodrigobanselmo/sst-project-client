import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SPageTitle from 'components/atoms/SPageTitle';
import SText from 'components/atoms/SText';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { NextPage } from 'next';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const CompanyPage: NextPage = () => {
  const { data: company } = useQueryCompany();
  const { onOpenModal } = useModal();

  const handleAddWorkspace = () => {
    onOpenModal(ModalEnum.WORKSPACE_ADD);
  };

  return (
    <SContainer>
      <SPageTitle icon={BusinessTwoToneIcon}>{company.name}</SPageTitle>
      <SText mt={20}>Proximo passo</SText>
      <SFlex mt={5}>
        <Box
          onClick={handleAddWorkspace}
          sx={{ p: 5, backgroundColor: 'background.box' }}
        >
          <SText>Cadastrar Unidades</SText>
        </Box>
      </SFlex>
      <SText mt={20}>A seguir</SText>
      <SFlex mt={5} gap={10}>
        <Box sx={{ p: 5, backgroundColor: 'background.box' }}>
          <SText>Cadastrar Empregados</SText>
        </Box>
        <Box sx={{ p: 5, backgroundColor: 'background.box' }}>
          <SText>Cadastrar Riscos</SText>
        </Box>
      </SFlex>
      {/* <EmployeesTable /> */}
      <ModalAddWorkspace />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
