import { Box } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { ActionPlanReadModel } from '@v2/models/security/models/action-plan/action-plan-read.model';
import { useMutateEditActionPlanPlanning } from '@v2/services/security/action-plan/action-plan/edit-action-plan/hooks/useMutateEditActionPlanPlanning';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

type PlanningFormFields = {
  monitoringMethod: string;
  resultCriteria: string;
};

export const ActionPlanPlanningSection = ({
  actionPlan,
  companyId,
}: {
  actionPlan: ActionPlanReadModel;
  companyId: string;
}) => {
  const editActionPlanPlanning = useMutateEditActionPlanPlanning();
  const isReadOnly = actionPlan.status === ActionPlanStatusEnum.CANCELED;

  const itemKey = useMemo(
    () =>
      `${actionPlan.uuid.riskDataId}:${actionPlan.uuid.recommendationId}:${actionPlan.uuid.workspaceId}`,
    [
      actionPlan.uuid.riskDataId,
      actionPlan.uuid.recommendationId,
      actionPlan.uuid.workspaceId,
    ],
  );

  const serverMonitoring = actionPlan.planning.monitoringMethod ?? '';
  const serverResultCriteria = actionPlan.planning.resultCriteria ?? '';

  const form = useForm<PlanningFormFields>({
    defaultValues: {
      monitoringMethod: serverMonitoring,
      resultCriteria: serverResultCriteria,
    },
  });

  useEffect(() => {
    if (editActionPlanPlanning.isPending) return;

    form.reset({
      monitoringMethod: serverMonitoring,
      resultCriteria: serverResultCriteria,
    });
  }, [
    itemKey,
    serverMonitoring,
    serverResultCriteria,
    editActionPlanPlanning.isPending,
    form,
  ]);

  const onSubmit = async (data: PlanningFormFields) => {
    const monitoringMethod = data.monitoringMethod.trim() || null;
    const resultCriteria = data.resultCriteria.trim() || null;

    await editActionPlanPlanning.mutateAsync({
      companyId,
      workspaceId: actionPlan.uuid.workspaceId,
      riskDataId: actionPlan.uuid.riskDataId,
      recommendationId: actionPlan.uuid.recommendationId,
      monitoringMethod,
      resultCriteria,
    });

    form.reset({
      monitoringMethod: monitoringMethod ?? '',
      resultCriteria: resultCriteria ?? '',
    });
  };

  return (
    <Box mt={8} mb={12}>
      <SText color="grey.600" fontSize={18}>
        Planejamento NR-01
      </SText>
      <SDivider sx={{ mt: 3, mb: 6 }} />
      <SForm form={form}>
        <SFormSection>
          <SFormRow>
            <SInputMultilineForm
              label="Forma de acompanhamento"
              name="monitoringMethod"
              fullWidth
              disabled={isReadOnly}
            />
          </SFormRow>
          <SFormRow>
            <SInputMultilineForm
              label="Critério de aferição"
              name="resultCriteria"
              fullWidth
              disabled={isReadOnly}
            />
          </SFormRow>
        </SFormSection>
        {!isReadOnly && (
          <Box display="flex" justifyContent="flex-end" mt={4}>
            <SButton
              color="success"
              text="Salvar Planejamento"
              loading={editActionPlanPlanning.isPending}
              onClick={form.handleSubmit(onSubmit)}
            />
          </Box>
        )}
      </SForm>
    </Box>
  );
};
