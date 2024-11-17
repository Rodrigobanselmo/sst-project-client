import { useRouter } from 'next/router';

import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SIconUser } from '@v2/assets/icons/SIconUser/SIconUser';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchReadActionPlanInfo } from '@v2/services/security/action-plan/read-action-plan-info/hooks/useFetchReadActionPlanInfo';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useActionPlanActions } from '../../hooks/useActionPlanActions';
import { InfoCardAvatar } from './components/InfoCardAvatar';
import { InfoCardSection } from './components/InfoCardSection';
import { InfoCardText } from './components/InfoCardText';

const ActionPlanInfoFormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../ActionPlanForms/ActionPlanInfoForm/ActionPlanInfoForm'
    );
    return mod.ActionPlanInfoForm;
  },
  { ssr: false },
);

export const ActionPlanInfo = ({ mb }: { mb: number[] }) => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();

  const companyId = router.query.companyId as string;

  const { queryParams, setQueryParams } =
    useQueryParamsState<IActionPlanFilterProps>();

  const { data, isLoading } = useFetchReadActionPlanInfo({
    companyId,
    workspaceId: 'f588207b-ac7b-4b63-9d85-cd5753f9b288',
  });

  const handleEdit = () => {
    openModal(
      ModalKeyEnum.EDIT_ACTION_PLAN_INFO,
      <ActionPlanInfoFormDynamic />,
    );
  };

  const { handleActionPlanEditStage, handleActionPlanExport } =
    useActionPlanActions({ companyId });

  const [nums, setNums] = useState();

  if (!data || isLoading) {
    return null;
  }

  return (
    <>
      <SPaper mb={mb}>
        <InfoCardSection gridColumns={'1fr 40px'}>
          <SFlex gap={6}>
            <InfoCardAvatar icon={<SIconUser />} />
            <InfoCardText
              schema="error"
              label="Coordenador"
              text={data?.coordinatorName}
            />
          </SFlex>
          <SIconButton onClick={handleEdit}>
            <SIconEdit fontSize={22} color="grey.600" />
          </SIconButton>
        </InfoCardSection>
        <SDivider />
        <InfoCardSection numColumns={4}>
          <InfoCardText
            label="Início Plano de Ação"
            text={data?.validityStartFormatted}
          />
          <InfoCardText
            label="Fim Plano de Ação"
            text={data?.validityEndFormatted}
          />
        </InfoCardSection>
        <SDivider />
        <InfoCardSection numColumns={4}>
          <InfoCardText
            label="Prazo risco muito alto"
            text={`${data?.periods.monthsLevel_5} meses`}
          />
          <InfoCardText
            label="Prazo risco alto"
            text={`${data?.periods.monthsLevel_4} meses`}
          />
          <InfoCardText
            label="Prazo risco médio"
            text={`${data?.periods.monthsLevel_3} meses`}
          />
          <InfoCardText
            label="Prazo risco baixo"
            text={`${data?.periods.monthsLevel_2} meses`}
          />
        </InfoCardSection>
      </SPaper>
    </>
  );
};
