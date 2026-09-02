import { FC, ReactNode } from 'react';

import { Alert, Box, Chip, CircularProgress } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SInput } from 'components/atoms/SInput';
import SSelect from 'components/atoms/SSelect';
import { SSwitch } from 'components/atoms/SSwitch';
import SText from 'components/atoms/SText';
import { useAccess } from 'core/hooks/useAccess';
import {
  WORKSPACE_EMERGENCY_POINT_TYPE_LABELS,
  WORKSPACE_EMERGENCY_POINT_TYPE_OPTIONS,
  WORKSPACE_EMERGENCY_SIGNAL_TYPE_OPTIONS,
  WorkspaceEmergencyPointType,
  WorkspaceEmergencySignalType,
} from 'core/interfaces/api/IWorkspaceEmergencyPlan';
import { PermissionEnum } from 'project/enum/permission.enum';

import {
  EmergencyPlanCollection,
  EmergencyPlanItemFrame,
} from './EmergencyPlanCollection';
import { EmergencyAlarmSignalPreview } from './EmergencyAlarmSignalPreview';
import {
  sanitizePositiveIntInput,
} from './emergency-plan.form';
import { useEditWorkspaceEmergencyPlan } from './useEditWorkspaceEmergencyPlan';

type WorkspaceEmergencyPlanSectionProps = {
  companyId?: string;
  workspaceId?: string;
};

const textareaSx = {
  width: '100%',
  '& .MuiInputBase-root': {
    alignItems: 'flex-start',
  },
};

const FieldGrid = ({
  columns,
  children,
}: {
  columns: string;
  children: ReactNode;
}) => (
  <Box
    sx={{
      display: 'grid',
      width: '100%',
      gap: 4,
      gridTemplateColumns: {
        xs: '1fr',
        md: columns,
      },
      '& > *': {
        minWidth: 0,
        width: '100%',
      },
    }}
  >
    {children}
  </Box>
);

export const WorkspaceEmergencyPlanSection: FC<
  WorkspaceEmergencyPlanSectionProps
> = ({ companyId, workspaceId }) => {
  const { isValidPermissions } = useAccess();
  const canManage = isValidPermissions([PermissionEnum.COMPANY]);
  const plan = useEditWorkspaceEmergencyPlan({ companyId, workspaceId });

  if (!workspaceId || !canManage) return null;

  return (
    <SFlex direction="column" gap={6} mt={8}>
      <Box>
        <SText color="text.label" fontSize={14}>
          Plano de Atendimento a Emergência
        </SText>
        <SText color="text.secondary" fontSize={13} mt={1}>
          Dados do estabelecimento anfitrião para uso no PGR. Independente do
          atendimento médico de primeiros socorros e do PCMSO.
        </SText>
      </Box>

      {plan.isLoading ? (
        <SFlex align="center" gap={3} py={4}>
          <CircularProgress size={22} />
          <SText color="text.secondary" fontSize={13}>
            Carregando plano de emergência...
          </SText>
        </SFlex>
      ) : null}

      {plan.isError ? (
        <Alert severity="error">
          Não foi possível carregar o plano de atendimento a emergência deste
          estabelecimento.
        </Alert>
      ) : null}

      {!plan.isLoading && !plan.isError && plan.isHydrated ? (
        <>
          <Box
            sx={{
              p: 5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: plan.form.enabled ? 'primary.main' : 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <SSwitch
              label="Utilizar dados específicos deste estabelecimento no Plano de Atendimento a Emergência do PGR"
              checked={plan.form.enabled}
              onChange={(_, checked) => plan.updateField('enabled', checked)}
              formControlProps={{
                sx: { alignItems: 'flex-start', ml: 0, mr: 0 },
              }}
            />
            {!plan.form.enabled ? (
              <SText color="text.secondary" fontSize={13} mt={3}>
                Os dados abaixo permanecem salvos. Enquanto o switch estiver
                desligado, eles não serão usados no PGR.
                {plan.summary.alarms ||
                plan.summary.points ||
                plan.summary.contacts ||
                plan.summary.maps
                  ? ` Cadastro atual: ${plan.summary.alarms} alarme(s), ${plan.summary.points} ponto(s), ${plan.summary.contacts} contato(s) e ${plan.summary.maps} mapa(s).`
                  : ''}
              </SText>
            ) : null}
          </Box>

          <Box
            sx={{
              p: 5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <SText fontSize={16} fontWeight={600} mb={4}>
              Orientações
            </SText>
            <SFlex direction="column" gap={5}>
              <SInput
                label="Orientações gerais em caso de emergência"
                labelPosition="top"
                fullWidth
                multiline
                minRows={8}
                value={plan.form.generalGuidance}
                onChange={(event) =>
                  plan.updateField('generalGuidance', event.target.value)
                }
                sx={textareaSx}
              />
              <SInput
                label="Tratativa e comunicação em caso de incidente"
                labelPosition="top"
                fullWidth
                multiline
                minRows={8}
                value={plan.form.incidentGuidance}
                onChange={(event) =>
                  plan.updateField('incidentGuidance', event.target.value)
                }
                sx={textareaSx}
              />
            </SFlex>
          </Box>

          <EmergencyPlanCollection
            title="Alarmes"
            description="Cadastre os sinais sonoros e o significado de cada um."
            addLabel="Adicionar alarme"
            emptyLabel="Nenhum alarme cadastrado."
            count={plan.form.alarms.length}
            onAdd={plan.addAlarm}
          >
            {plan.form.alarms.map((item, index) => (
              <EmergencyPlanItemFrame
                key={item.localKey}
                title={item.name.trim() || 'Novo alarme'}
                index={index}
                total={plan.form.alarms.length}
                onMoveUp={() => plan.moveAlarm(index, -1)}
                onMoveDown={() => plan.moveAlarm(index, 1)}
                onRemove={() => plan.removeAlarm(item.localKey)}
              >
                <SFlex direction="column" gap={4}>
                  <FieldGrid columns="minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 1.1fr) minmax(0, 0.9fr) minmax(0, 1.4fr)">
                    <SInput
                      label="Nome"
                      labelPosition="top"
                      fullWidth
                      value={item.name}
                      onChange={(event) =>
                        plan.updateAlarm(item.localKey, {
                          name: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SInput
                      label="Quantidade de toques"
                      labelPosition="top"
                      fullWidth
                      inputMode="numeric"
                      placeholder="Ex.: 8"
                      value={item.signalCount}
                      onChange={(event) =>
                        plan.updateAlarm(item.localKey, {
                          signalCount: sanitizePositiveIntInput(
                            event.target.value,
                          ),
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SSelect
                      label="Tipo de toque"
                      labelPosition="top"
                      value={item.signalType}
                      emptyItem
                      placeholder="Selecione"
                      options={WORKSPACE_EMERGENCY_SIGNAL_TYPE_OPTIONS}
                      optionsFieldName={{
                        valueField: 'value',
                        contentField: 'content',
                      }}
                      onChange={(event) =>
                        plan.updateAlarm(item.localKey, {
                          signalType: event.target
                            .value as WorkspaceEmergencySignalType,
                        })
                      }
                    />
                    <SInput
                      label="Duração (segundos)"
                      labelPosition="top"
                      fullWidth
                      inputMode="numeric"
                      placeholder="Ex.: 10"
                      value={item.durationSeconds}
                      onChange={(event) =>
                        plan.updateAlarm(item.localKey, {
                          durationSeconds: sanitizePositiveIntInput(
                            event.target.value,
                          ),
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SInput
                      label="Significado"
                      labelPosition="top"
                      fullWidth
                      value={item.meaning}
                      onChange={(event) =>
                        plan.updateAlarm(item.localKey, {
                          meaning: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                  </FieldGrid>
                  <EmergencyAlarmSignalPreview
                    signalType={item.signalType}
                    signalCount={item.signalCount}
                    durationSeconds={item.durationSeconds}
                  />
                  <SInput
                    label="Orientação"
                    labelPosition="top"
                    fullWidth
                    multiline
                    minRows={4}
                    value={item.guidance}
                    onChange={(event) =>
                      plan.updateAlarm(item.localKey, {
                        guidance: event.target.value,
                      })
                    }
                    sx={textareaSx}
                  />
                </SFlex>
              </EmergencyPlanItemFrame>
            ))}
          </EmergencyPlanCollection>

          <EmergencyPlanCollection
            title="Pontos de encontro e apanha"
            description="Diferencie visualmente os pontos de encontro (PE) dos pontos de apanha (PA)."
            addLabel="Adicionar ponto"
            emptyLabel="Nenhum ponto cadastrado."
            count={plan.form.points.length}
            onAdd={plan.addPoint}
          >
            {plan.form.points.map((item, index) => (
              <EmergencyPlanItemFrame
                key={item.localKey}
                title={item.name.trim() || item.code.trim() || 'Novo ponto'}
                index={index}
                total={plan.form.points.length}
                badge={
                  <Chip
                    size="small"
                    label={WORKSPACE_EMERGENCY_POINT_TYPE_LABELS[item.type]}
                    color={item.type === 'APANHA' ? 'warning' : 'success'}
                    variant="outlined"
                  />
                }
                onMoveUp={() => plan.movePoint(index, -1)}
                onMoveDown={() => plan.movePoint(index, 1)}
                onRemove={() => plan.removePoint(item.localKey)}
              >
                <SFlex direction="column" gap={4}>
                  <FieldGrid columns="minmax(0, 1.1fr) minmax(0, 0.8fr) minmax(0, 1.6fr)">
                    <SSelect
                      label="Tipo"
                      labelPosition="top"
                      value={item.type}
                      options={WORKSPACE_EMERGENCY_POINT_TYPE_OPTIONS}
                      optionsFieldName={{
                        valueField: 'value',
                        contentField: 'content',
                      }}
                      onChange={(event) =>
                        plan.updatePoint(item.localKey, {
                          type: event.target
                            .value as WorkspaceEmergencyPointType,
                        })
                      }
                    />
                    <SInput
                      label="Código"
                      labelPosition="top"
                      fullWidth
                      placeholder="Ex.: PE-1"
                      value={item.code}
                      onChange={(event) =>
                        plan.updatePoint(item.localKey, {
                          code: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SInput
                      label="Nome"
                      labelPosition="top"
                      fullWidth
                      value={item.name}
                      onChange={(event) =>
                        plan.updatePoint(item.localKey, {
                          name: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                  </FieldGrid>
                  <SInput
                    label="Descrição"
                    labelPosition="top"
                    fullWidth
                    multiline
                    minRows={3}
                    value={item.description}
                    onChange={(event) =>
                      plan.updatePoint(item.localKey, {
                        description: event.target.value,
                      })
                    }
                    sx={textareaSx}
                  />
                  <SInput
                    label="Orientação"
                    labelPosition="top"
                    fullWidth
                    multiline
                    minRows={3}
                    value={item.guidance}
                    onChange={(event) =>
                      plan.updatePoint(item.localKey, {
                        guidance: event.target.value,
                      })
                    }
                    sx={textareaSx}
                  />
                </SFlex>
              </EmergencyPlanItemFrame>
            ))}
          </EmergencyPlanCollection>

          <EmergencyPlanCollection
            title="Contatos e comunicação"
            description="Telefone, celular e rádio são opcionais. Um contato pode ser apenas canal de rádio."
            addLabel="Adicionar contato"
            emptyLabel="Nenhum contato cadastrado."
            count={plan.form.contacts.length}
            onAdd={plan.addContact}
          >
            {plan.form.contacts.map((item, index) => (
              <EmergencyPlanItemFrame
                key={item.localKey}
                title={item.name.trim() || 'Novo contato'}
                index={index}
                total={plan.form.contacts.length}
                onMoveUp={() => plan.moveContact(index, -1)}
                onMoveDown={() => plan.moveContact(index, 1)}
                onRemove={() => plan.removeContact(item.localKey)}
              >
                <SFlex direction="column" gap={4}>
                  <FieldGrid columns="repeat(2, minmax(0, 1fr))">
                    <SInput
                      label="Nome"
                      labelPosition="top"
                      fullWidth
                      value={item.name}
                      onChange={(event) =>
                        plan.updateContact(item.localKey, {
                          name: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SInput
                      label="Área"
                      labelPosition="top"
                      fullWidth
                      value={item.area}
                      onChange={(event) =>
                        plan.updateContact(item.localKey, {
                          area: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                  </FieldGrid>
                  <FieldGrid columns="repeat(4, minmax(0, 1fr))">
                    <SInput
                      label="Telefone"
                      labelPosition="top"
                      fullWidth
                      value={item.phone}
                      onChange={(event) =>
                        plan.updateContact(item.localKey, {
                          phone: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SInput
                      label="Celular"
                      labelPosition="top"
                      fullWidth
                      value={item.mobile}
                      onChange={(event) =>
                        plan.updateContact(item.localKey, {
                          mobile: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SInput
                      label="Canal de rádio"
                      labelPosition="top"
                      fullWidth
                      placeholder="Ex.: Canal 12"
                      value={item.radioChannel}
                      onChange={(event) =>
                        plan.updateContact(item.localKey, {
                          radioChannel: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                    <SInput
                      label="Zona"
                      labelPosition="top"
                      fullWidth
                      placeholder="Ex.: zona 04"
                      value={item.zone}
                      onChange={(event) =>
                        plan.updateContact(item.localKey, {
                          zone: event.target.value,
                        })
                      }
                      sx={{ width: '100%' }}
                    />
                  </FieldGrid>
                  <SInput
                    label="Observação"
                    labelPosition="top"
                    fullWidth
                    multiline
                    minRows={3}
                    value={item.observation}
                    onChange={(event) =>
                      plan.updateContact(item.localKey, {
                        observation: event.target.value,
                      })
                    }
                    sx={textareaSx}
                  />
                </SFlex>
              </EmergencyPlanItemFrame>
            ))}
          </EmergencyPlanCollection>

          <EmergencyPlanCollection
            title="Mapas e imagens"
            description="Envie as plantas e mapas do estabelecimento. O arquivo usa o upload já existente. Se você fechar o cadastro sem salvar o plano, envios desta sessão ainda não confirmados serão desfeitos."
            addLabel="Adicionar mapa"
            emptyLabel="Nenhum mapa cadastrado."
            count={plan.form.maps.length}
            onAdd={plan.handleUploadMap}
          >
            {plan.form.maps.map((item, index) => (
              <EmergencyPlanItemFrame
                key={item.localKey}
                title={item.title.trim() || 'Mapa de emergência'}
                index={index}
                total={plan.form.maps.length}
                onMoveUp={() => plan.moveMap(index, -1)}
                onMoveDown={() => plan.moveMap(index, 1)}
                onRemove={() => plan.removeMap(item.localKey)}
              >
                <SFlex direction="column" gap={4}>
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: 180,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.photoUrl ? (
                      <Box
                        component="img"
                        src={item.photoUrl}
                        alt={item.title || 'Mapa de emergência'}
                        sx={{
                          width: '100%',
                          maxHeight: 360,
                          objectFit: 'contain',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <SText color="text.secondary" fontSize={13} p={4}>
                        Imagem indisponível
                      </SText>
                    )}
                  </Box>
                  <SInput
                    label="Título"
                    labelPosition="top"
                    fullWidth
                    value={item.title}
                    onChange={(event) =>
                      plan.updateMap(item.localKey, {
                        title: event.target.value,
                      })
                    }
                    sx={{ width: '100%' }}
                  />
                  <SInput
                    label="Legenda"
                    labelPosition="top"
                    fullWidth
                    multiline
                    minRows={3}
                    value={item.caption}
                    onChange={(event) =>
                      plan.updateMap(item.localKey, {
                        caption: event.target.value,
                      })
                    }
                    sx={textareaSx}
                  />
                </SFlex>
              </EmergencyPlanItemFrame>
            ))}
          </EmergencyPlanCollection>

          <SFlex justify="space-between" align="center" mt={2} flexWrap="wrap" gap={3}>
            {plan.isDirty ? (
              <SText color="warning.main" fontSize={13}>
                Alterações não salvas
              </SText>
            ) : (
              <span />
            )}
            <SButton
              type="button"
              variant="contained"
              disabled={!plan.isHydrated || plan.isSaving || plan.isUploading}
              loading={plan.isSaving}
              onClick={plan.handleSave}
            >
              Salvar plano de emergência
            </SButton>
          </SFlex>
        </>
      ) : null}
    </SFlex>
  );
};
