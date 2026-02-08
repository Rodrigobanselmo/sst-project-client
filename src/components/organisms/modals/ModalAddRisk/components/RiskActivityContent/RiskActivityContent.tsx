/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from 'react';

import { Box, Icon, Paper, Stack, Divider, Collapse } from '@mui/material';
import { InputForm } from 'components/molecules/form/input';
import SText from 'components/atoms/SText';
import SFlex from 'components/atoms/SFlex';

import AddIcon, { SAddIcon } from 'assets/icons/SAddIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import SIconButton from 'components/atoms/SIconButton';
import { STagButton } from 'components/atoms/STagButton';
import { useFieldArray } from 'react-hook-form';
import { IUseAddRisk } from '../../hooks/useAddRisk';
import {
  ActivityTypeEnum,
  RiskFactorActivities,
} from 'core/interfaces/api/IRiskFactors';

export const RiskActivityContent: FC<{ children?: any } & IUseAddRisk> = ({
  riskData,
  setRiskData,
  control,
  setValue,
  type,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'activities',
  });

  const typedFields = fields as unknown as RiskFactorActivities[];

  const periculosidadeActivities = typedFields.filter(
    (activity) => activity.activityType === ActivityTypeEnum.PERICULOSIDADE,
  );
  const insalubridadeActivities = typedFields.filter(
    (activity) => activity.activityType === ActivityTypeEnum.INSALUBRIDADE,
  );

  return (
    <Box mt={8}>
      {/* Atividades Periculosas */}
      <Box mb={6}>
        <SFlex align="center" justify="space-between" mb={4}>
          <SFlex align="center" gap={2}>
            <Box
              sx={{
                width: 8,
                height: 32,
                backgroundColor: 'error.main',
                borderRadius: 1,
              }}
            />
            <SText fontSize={16} fontWeight={600} color="text.primary">
              Atividades Periculosas
            </SText>
          </SFlex>
          <STagButton
            text={''}
            icon={AddIcon}
            onClick={() =>
              append({
                description: '',
                subActivities: [],
                activityType: ActivityTypeEnum.PERICULOSIDADE,
              })
            }
            bg="error.main"
            active
          />
        </SFlex>

        {periculosidadeActivities.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'grey.50',
              border: '2px dashed',
              borderColor: 'error.light',
            }}
          >
            <SText color="text.secondary" fontSize={14}>
              Nenhuma atividade periculosa adicionada.
            </SText>
          </Paper>
        )}

        <Stack spacing={3}>
          {typedFields.map((activity, globalIndex) => {
            if (activity.activityType !== ActivityTypeEnum.PERICULOSIDADE)
              return null;
            const relativeIndex =
              typedFields
                .slice(0, globalIndex)
                .filter(
                  (a) => a.activityType === ActivityTypeEnum.PERICULOSIDADE,
                ).length + 1;
            return (
              <Collapse key={fields[globalIndex].id} in={true} timeout={300}>
                <RiskActivityCard
                  control={control}
                  index={globalIndex}
                  displayIndex={relativeIndex}
                  setValue={setValue}
                  onRemove={() => remove(globalIndex)}
                  totalActivities={fields.length}
                  activityType={ActivityTypeEnum.PERICULOSIDADE}
                />
              </Collapse>
            );
          })}
        </Stack>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Atividades Insalubres */}
      <Box>
        <SFlex align="center" justify="space-between" mb={4}>
          <SFlex align="center" gap={2}>
            <Box
              sx={{
                width: 8,
                height: 32,
                backgroundColor: 'warning.main',
                borderRadius: 1,
              }}
            />
            <SText fontSize={16} fontWeight={600} color="text.primary">
              Atividades Insalubres
            </SText>
          </SFlex>
          <STagButton
            icon={AddIcon}
            onClick={() =>
              append({
                description: '',
                subActivities: [],
                activityType: ActivityTypeEnum.INSALUBRIDADE,
              })
            }
            bg="warning.main"
            active
          />
        </SFlex>

        {insalubridadeActivities.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: 'grey.50',
              border: '2px dashed',
              borderColor: 'warning.light',
            }}
          >
            <SText color="text.secondary" fontSize={14}>
              Nenhuma atividade insalubre adicionada.
            </SText>
          </Paper>
        )}

        <Stack spacing={3}>
          {typedFields.map((activity, globalIndex) => {
            if (activity.activityType !== ActivityTypeEnum.INSALUBRIDADE)
              return null;
            const relativeIndex =
              typedFields
                .slice(0, globalIndex)
                .filter(
                  (a) => a.activityType === ActivityTypeEnum.INSALUBRIDADE,
                ).length + 1;
            return (
              <Collapse key={fields[globalIndex].id} in={true} timeout={300}>
                <RiskActivityCard
                  control={control}
                  index={globalIndex}
                  displayIndex={relativeIndex}
                  setValue={setValue}
                  onRemove={() => remove(globalIndex)}
                  totalActivities={fields.length}
                  activityType={ActivityTypeEnum.INSALUBRIDADE}
                />
              </Collapse>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
};

export const RiskActivityCard: FC<
  {
    children?: any;
    index: number;
    displayIndex: number;
    onRemove: () => void;
    totalActivities: number;
    activityType?: ActivityTypeEnum;
  } & Pick<IUseAddRisk, 'control' | 'setValue'>
> = ({
  control,
  index,
  displayIndex,
  setValue,
  onRemove,
  totalActivities,
  activityType,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `activities.${index}.subActivities`,
  });

  const borderColor =
    activityType === ActivityTypeEnum.PERICULOSIDADE
      ? 'error.light'
      : activityType === ActivityTypeEnum.INSALUBRIDADE
        ? 'warning.light'
        : 'grey.300';

  const hoverBorderColor =
    activityType === ActivityTypeEnum.PERICULOSIDADE
      ? 'error.main'
      : activityType === ActivityTypeEnum.INSALUBRIDADE
        ? 'warning.main'
        : 'primary.main';

  const badgeColor =
    activityType === ActivityTypeEnum.PERICULOSIDADE
      ? 'error.main'
      : activityType === ActivityTypeEnum.INSALUBRIDADE
        ? 'warning.main'
        : 'primary.main';

  return (
    <Paper
      elevation={2}
      sx={{
        p: 4,
        border: '1px solid',
        borderColor: borderColor,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: hoverBorderColor,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Activity Header */}
      <SFlex align="flex-start" justify="space-between" mb={3}>
        <SFlex align="center" gap={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SText fontSize={14} fontWeight={600}>
              {displayIndex}.
            </SText>
          </Box>
          <SText fontSize={15} fontWeight={500} color="text.secondary">
            Atividade
          </SText>
        </SFlex>

        <SFlex gap={1}>
          <SIconButton
            size="small"
            onClick={() => append({ description: '' })}
            tooltip="Adicionar sub-atividade"
            sx={{
              backgroundColor: 'success.light',
              '&:hover': { backgroundColor: 'success.main' },
              borderRadius: '50%',
            }}
          >
            <Icon
              component={SAddIcon}
              sx={{ fontSize: '1.1rem', color: 'white' }}
            />
          </SIconButton>
          <SIconButton
            size="small"
            onClick={onRemove}
            tooltip="Remover atividade"
            color="error"
          >
            <Icon component={SDeleteIcon} sx={{ fontSize: '1.1rem' }} />
          </SIconButton>
        </SFlex>
      </SFlex>

      {/* Activity Description */}
      <Box mb={fields.length > 0 ? 3 : 0}>
        <InputForm
          multiline
          minRows={2}
          maxRows={5}
          setValue={setValue}
          label="Descrição da Atividade"
          control={control}
          sx={{ width: '100%' }}
          placeholder={`Descreva a atividade ${displayIndex}...`}
          name={`activities.${index}.description`}
          size="small"
        />
      </Box>

      {/* Sub-activities Section */}
      {fields.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Box>
            <SText fontSize={14} fontWeight={500} color="text.secondary" mb={2}>
              Sub-atividades / Áreas de Risco
            </SText>
            <Stack spacing={2}>
              {fields.map((subActivity, _index) => (
                <Collapse key={subActivity.id} in={true} timeout={200}>
                  <Box
                    sx={{
                      pl: 4,
                      borderLeft: '3px solid',
                      borderColor: 'primary.light',
                      position: 'relative',
                    }}
                  >
                    <SFlex align="flex-start" gap={2}>
                      <Box
                        sx={{
                          minWidth: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mt: 2,
                        }}
                      >
                        <SText
                          fontSize={11}
                          fontWeight={600}
                          color="text.primary"
                        >
                          {_index + 1}
                        </SText>
                      </Box>
                      <Box flex={1}>
                        <InputForm
                          multiline
                          variant="outlined"
                          minRows={2}
                          maxRows={5}
                          setValue={setValue}
                          control={control}
                          sx={{ width: '100%' }}
                          placeholder={`Descrição da sub-atividade ${_index + 1} / área de risco`}
                          name={`activities.${index}.subActivities.${_index}.description`}
                          size="small"
                        />
                      </Box>
                      <SIconButton
                        size="small"
                        onClick={() => remove(_index)}
                        tooltip="Remover sub-atividade"
                        color="error"
                      >
                        <Icon
                          component={SDeleteIcon}
                          sx={{ fontSize: '0.9rem' }}
                        />
                      </SIconButton>
                    </SFlex>
                  </Box>
                </Collapse>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Paper>
  );
};
