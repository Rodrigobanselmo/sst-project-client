import { SIconEdit } from '@v2/assets/icons/SIconEdit/SIconEdit';
import { SIconUser } from '@v2/assets/icons/SIconUser/SIconUser';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SIconButton } from '@v2/components/atoms/SIconButton/SIconButton';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useFetchReadActionPlanInfo } from '@v2/services/security/action-plan/action-plan-info/read-action-plan-info/hooks/useFetchReadActionPlanInfo';
import { useActionPlanInfoActions } from '../../hooks/useActionPlanInfoActions';
import { InfoCardSection } from '@v2/components/organisms/SInfoCard/components/InfoCardSection/InfoCardSection';
import { InfoCardText } from '@v2/components/organisms/SInfoCard/components/InfoCardText/InfoCardText';
import { InfoCardAvatar } from '@v2/components/organisms/SInfoCard/components/InfoCardAvatar/InfoCardAvatar';

export const ActionPlanInfo = ({
  mb,
  companyId,
  workspaceId,
}: {
  mb: number[];
  companyId: string;
  workspaceId: string;
}) => {
  const { data, isLoading } = useFetchReadActionPlanInfo({
    companyId,
    workspaceId: workspaceId,
  });

  const { onAddActionPlanInfo } = useActionPlanInfoActions({
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
              schema={data.coordinator ? 'normal' : 'error'}
              label="Coordenador"
              text={data?.coordinatorName}
            />
          </SFlex>
          <SIconButton onClick={onAddActionPlanInfo}>
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
