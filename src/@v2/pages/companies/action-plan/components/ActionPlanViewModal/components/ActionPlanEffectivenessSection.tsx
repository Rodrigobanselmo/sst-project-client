import { Box } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SFormSection } from '@v2/components/forms/components/SFormSection/SFormSection';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { EffectivenessStatusEnum } from '@v2/models/security/enums/effectiveness-status.enum';
import { ActionPlanReadModel } from '@v2/models/security/models/action-plan/action-plan-read.model';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import {
  getEffectivenessOptionsForStatus,
  resolveEffectivenessOption,
} from '@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-effectiveness-type-map';
import { useMutateEditActionPlanEffectiveness } from '@v2/services/security/action-plan/action-plan/edit-action-plan-effectiveness/hooks/useMutateEditActionPlanEffectiveness';
import { dateUtils } from '@v2/utils/date-utils';
import palette from 'configs/theme/palette';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActionPlanMeasureCorrectionAlert,
  isEffectivenessRequiringCorrection,
} from './ActionPlanMeasureCorrectionAlert';

type EffectivenessFormFields = {
  effectivenessStatus: { label: string; value: EffectivenessStatusEnum };
  effectivenessComment: string;
};

export const ActionPlanEffectivenessSection = ({
  actionPlan,
  companyId,
}: {
  actionPlan: ActionPlanReadModel;
  companyId: string;
}) => {
  const editEffectiveness = useMutateEditActionPlanEffectiveness();
  const executionStatus = actionPlan.status;
  const effectivenessStatus =
    actionPlan.effectiveness?.status ?? EffectivenessStatusEnum.NOT_EVALUATED;
  const effectivenessComment = actionPlan.effectiveness?.comment ?? '';

  const options = useMemo(
    () => getEffectivenessOptionsForStatus(executionStatus),
    [executionStatus],
  );

  const currentOption = useMemo(
    () => resolveEffectivenessOption(effectivenessStatus, executionStatus),
    [effectivenessStatus, executionStatus],
  );

  const isEditable =
    executionStatus === ActionPlanStatusEnum.DONE ||
    executionStatus === ActionPlanStatusEnum.CANCELED;

  const itemKey = useMemo(
    () =>
      `${actionPlan.uuid.riskDataId}:${actionPlan.uuid.recommendationId}:${actionPlan.uuid.workspaceId}`,
    [
      actionPlan.uuid.riskDataId,
      actionPlan.uuid.recommendationId,
      actionPlan.uuid.workspaceId,
    ],
  );

  const form = useForm<EffectivenessFormFields>({
    defaultValues: {
      effectivenessStatus: currentOption,
      effectivenessComment,
    },
  });

  useEffect(() => {
    if (editEffectiveness.isPending) return;

    form.reset({
      effectivenessStatus: currentOption,
      effectivenessComment,
    });
  }, [
    itemKey,
    currentOption,
    effectivenessComment,
    editEffectiveness.isPending,
    form,
  ]);

  const selectedStatus = form.watch('effectivenessStatus')?.value;
  const displayEffectivenessStatus = selectedStatus ?? effectivenessStatus;
  const showCorrectionAlert = isEffectivenessRequiringCorrection(
    displayEffectivenessStatus,
  );

  useEffect(() => {
    if (selectedStatus === EffectivenessStatusEnum.NOT_EVALUATED) {
      form.setValue('effectivenessComment', '');
    }
  }, [selectedStatus, form]);

  const onSubmit = async (data: EffectivenessFormFields) => {
    const status = data.effectivenessStatus?.value;

    if (!status) {
      form.setError('effectivenessStatus', {
        message: 'Selecione o status da eficácia',
      });
      return;
    }

    if (
      (status === EffectivenessStatusEnum.PARTIALLY_EFFECTIVE ||
        status === EffectivenessStatusEnum.INEFFECTIVE) &&
      data.effectivenessComment.trim().length < 10
    ) {
      form.setError('effectivenessComment', {
        message:
          'Descreva o resultado da aferição com pelo menos 10 caracteres',
      });
      return;
    }

    await editEffectiveness.mutateAsync({
      companyId,
      workspaceId: actionPlan.uuid.workspaceId,
      riskDataId: actionPlan.uuid.riskDataId,
      recommendationId: actionPlan.uuid.recommendationId,
      effectivenessStatus: status,
      effectivenessComment:
        status === EffectivenessStatusEnum.NOT_EVALUATED
          ? null
          : data.effectivenessComment.trim() || null,
    });
  };

  const effectivenessDate = actionPlan.effectiveness?.date;
  const formattedDate =
    effectivenessDate && !Number.isNaN(new Date(effectivenessDate).getTime())
      ? dateUtils(effectivenessDate).format('DD/MM/YYYY HH:mm')
      : null;

  const evaluatedBy = actionPlan.effectiveness?.evaluatedBy;
  const executionStatusLabel =
    ActionPlanStatusTypeTranslate[executionStatus] ?? executionStatus;

  return (
    <Box mt={8} mb={12}>
      <SText color="grey.600" fontSize={18}>
        Verificação de eficácia
      </SText>
      <SDivider sx={{ mt: 3, mb: 6 }} />
      <SText
        mb={8}
        fontSize={14}
        p={3}
        px={4}
        bgcolor={palette.schema.blueFade}
        borderRadius={1}
      >
        A conclusão indica que a ação foi executada. A eficácia indica se a
        medida funcionou após verificação.
      </SText>
      <SText mb={4} fontSize={14} color="grey.600">
        Status de execução: {executionStatusLabel}
      </SText>
      <SForm form={form}>
        <SFormSection>
          <SFormRow>
            <SSearchSelectForm
              boxProps={{ flex: 1 }}
              label="Status da eficácia"
              name="effectivenessStatus"
              options={options}
              disabled={!isEditable}
              getOptionLabel={(option) => option?.label ?? ''}
              getOptionValue={(option) => option?.value ?? ''}
            />
          </SFormRow>
          <SFormRow>
            <SInputMultilineForm
              label="Resultado/comentário da aferição"
              name="effectivenessComment"
              fullWidth
              disabled={
                !isEditable ||
                selectedStatus === EffectivenessStatusEnum.NOT_EVALUATED
              }
            />
          </SFormRow>
        </SFormSection>
        {showCorrectionAlert && <ActionPlanMeasureCorrectionAlert />}
        {(formattedDate || evaluatedBy?.name) && (
          <Box mt={4}>
            {formattedDate && (
              <SText fontSize={14} color="grey.600" mb={2}>
                Avaliado em: {formattedDate}
              </SText>
            )}
            {evaluatedBy?.name && (
              <SText fontSize={14} color="grey.600">
                Avaliado por: {evaluatedBy.name}
              </SText>
            )}
          </Box>
        )}
        {isEditable && (
          <Box display="flex" justifyContent="flex-end" mt={4}>
            <SButton
              color="success"
              text="Salvar Eficácia"
              loading={editEffectiveness.isPending}
              onClick={form.handleSubmit(onSubmit)}
            />
          </Box>
        )}
      </SForm>
    </Box>
  );
};
