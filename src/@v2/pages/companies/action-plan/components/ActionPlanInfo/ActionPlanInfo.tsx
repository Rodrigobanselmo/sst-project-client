import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SIconUser } from '@v2/assets/icons/SIconUser/SIconUser';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { useFetchReadActionPlanInfo } from '@v2/services/security/action-plan/read-action-plan-info/hooks/useFetchReadActionPlanInfo';
import { useActionPlanActions } from '../../hooks/useActionPlanActions';
import { InfoCardAvatar } from './components/InfoCardAvatar';
import { InfoCardSection } from './components/InfoCardSection';
import { InfoCardText } from './components/InfoCardText';
import { Skeleton } from '@mui/material';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';

export const ActionPlanInfo = ({
  mb,
  companyId,
  workspaceId,
}: {
  mb: number[];
  companyId: string;
  workspaceId?: string;
}) => {
  const { data, isLoading } = useFetchReadActionPlanInfo({
    companyId,
    workspaceId: workspaceId || '',
  });

  const { handleEditActionPlanInfo } = useActionPlanActions({
    companyId,
    workspaceId,
  });

  if (isLoading) {
    return <SSkeleton height={200} sx={{ mb: 10 }} />;
  }

  if (!data || !workspaceId) {
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
          <SIconButton onClick={handleEditActionPlanInfo}>
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
