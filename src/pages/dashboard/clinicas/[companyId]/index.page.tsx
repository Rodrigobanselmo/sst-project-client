import { useCallback, useMemo } from 'react';

import { Icon } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SPageTitle from 'components/atoms/SPageTitle';
import SText from 'components/atoms/SText';
import { ModalEditClinic } from 'components/organisms/modals/company/ModalEditClinic/ModalEditClinic';
import { ModalAddClinicExam } from 'components/organisms/modals/ModalAddClinicExam/ModalAddClinicExam';
import { ModalAddExam } from 'components/organisms/modals/ModalAddExam/ModalAddExam';
import { ModalViewClinicExams } from 'components/organisms/modals/ModalViewClinicExams';
import { ModalViewProfessional } from 'components/organisms/modals/ModalViewProfessional';
import {
  ModalViewUsers,
  StackModalViewUsers,
} from 'components/organisms/modals/ModalViewUsers/ModalViewUsers';
import { NextPage } from 'next';

import SArrowNextIcon from 'assets/icons/SArrowNextIcon';
import SClinicIcon from 'assets/icons/SClinicIcon';

import { useClinicStep } from 'core/hooks/action-steps/useClinicStep';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { SActionButton } from '../../../../components/atoms/SActionButton';

const CompanyPage: NextPage = () => {
  const { data: company, isLoading } = useQueryCompany();
  const { nextStepMemo, nextStep, actionsStepMemo } = useClinicStep();

  useFetchFeedback(isLoading && !company?.id);

  return (
    <SContainer>
      <SPageTitle icon={SClinicIcon}>{company.fantasy}</SPageTitle>
      {nextStepMemo && (
        <>
          <SText mt={20}>Proximo passo</SText>
          <SFlex mt={5} gap={10} flexWrap="wrap">
            {nextStepMemo.map((props) => (
              <SActionButton key={props.text} {...props} />
            ))}
            <SIconButton
              onClick={nextStep}
              tooltip="Pular para próximo passo"
              sx={{
                alignSelf: 'center',
              }}
            >
              <Icon
                component={SArrowNextIcon}
                sx={{
                  fontSize: '1.2rem',
                }}
              />
            </SIconButton>
          </SFlex>
        </>
      )}
      <SText mt={20}>Dados da clínica</SText>
      <SFlex mt={5} gap={10} flexWrap="wrap">
        {actionsStepMemo.map((props) => (
          <SActionButton key={props.text} {...props} />
        ))}
      </SFlex>

      <ModalViewProfessional />
      <ModalViewClinicExams />
      <ModalEditClinic />
      <ModalAddExam />
      <ModalAddClinicExam />

      <ModalViewUsers />
      <StackModalViewUsers />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
