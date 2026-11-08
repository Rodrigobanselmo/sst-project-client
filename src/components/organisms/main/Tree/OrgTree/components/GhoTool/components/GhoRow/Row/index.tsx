import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { explicitGhoSelectionTreeIds } from '../../../../../utils/explicit-gho-selection-tree-ids.util';
import { useGseVisualAssistance } from '../../../../GseVisualAssistance/GseVisualAssistance.context';
import {
  groupVisualState,
  REVIEW_COLORS,
} from '../../../../GseVisualAssistance/gse-integrated-review.model';
import React, { FC } from 'react';

import { Box, Icon, Button, TextField, Typography } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SIconButton from 'components/atoms/SIconButton';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';
import { SPopperHelper } from 'components/molecules/SPopperArrow/SPopperHelper';

import SCloseIcon from 'assets/icons/SCloseIcon';
import SDeleteIcon from 'assets/icons/SDeleteIcon';
import SEditIcon from 'assets/icons/SEditIcon';
import SHierarchyIcon from 'assets/icons/SHierarchyIcon';

import { useOrgMultiWorkspaceMode } from 'core/hooks/useOrgMultiWorkspaceMode';
import { ORG_MULTI_WORKSPACE_DISABLED_HINT } from 'core/utils/org-workspace-query';

import { STBoxItem } from './styles';
import { RowItemsProps } from './types';

export const Row: FC<{ children?: any } & RowItemsProps> = ({
  data,
  isSelected,
  isDeleteLoading,
  handleDeleteGHO,
  handleSelectGHO,
  handleEditGHO,
  hide,
  isFirst,
  anchorEl,
}) => {
  const assistance = useGseVisualAssistance();
  const assisted = !!assistance?.active;
  const visualState = assistance
    ? groupVisualState(assistance.review, data.id)
    : 'EXISTENTE_SEM_ALTERACOES';
  const tone =
    REVIEW_COLORS[
      visualState === 'NOVO_SUGERIDO'
        ? 'newGroup'
        : visualState === 'EXISTENTE_COM_ALTERACOES'
          ? 'changedGroup'
          : 'neutral'
    ];
  const proposed = assistance?.review.newGroups.find((g) => g.id === data.id);
  const changes =
    assistance?.review.changes.filter(
      (c) => c.groupId === data.id && c.decision !== 'rejected',
    ) || [];
  const isOrgMultiWorkspace = useOrgMultiWorkspaceMode();
  const actionHint = isOrgMultiWorkspace
    ? ORG_MULTI_WORKSPACE_DISABLED_HINT
    : undefined;
  const isEnvironment = data.type === HomoTypeEnum.ENVIRONMENT;
  const environmentLinkLabel = isSelected
    ? 'Fechar seleção de vínculos do ambiente'
    : 'Localizar vínculos do ambiente na árvore';
  const hierarchies =
    isEnvironment
      ? explicitGhoSelectionTreeIds(data)
      : data.hierarchies
        ? data.hierarchies
            .map((value) =>
              data?.workspaceIds?.map(
                (workspaceId) => value.id + '//' + workspaceId,
              ),
            )
            .flat(1)
        : [];

  return (
    <STBoxItem
      sx={{
        border: isSelected ? ' 2px solid' : ' 1px solid',
        borderColor: assisted
          ? tone.color
          : isSelected
            ? 'info.main'
            : 'background.divider',
        ...(assisted && {
          backgroundColor: tone.background,
          color: tone.color,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 0.5,
        }),
        minHeight: '46px',
      }}
    >
      <STooltip minLength={15} enterDelay={1000} title={data.name}>
        <Box
          sx={{
            display: 'flex',
            maxWidth: assisted ? '100%' : '75%',
            overflow: 'hidden',
          }}
        >
          <SText
            lineNumber={2}
            sx={assisted ? { color: tone.color } : undefined}
          >
            {data.name}
          </SText>
        </Box>
      </STooltip>
      {assisted && (
        <Typography
          sx={{ gridColumn: '1 / -1', gridRow: 2 }}
          variant="caption"
          title={
            visualState === 'EXISTENTE_COM_ALTERACOES'
              ? 'Este GSE possui alterações propostas, ainda não gravadas.'
              : undefined
          }
        >
          {proposed
            ? `${proposed.decision === 'accepted' ? '✓ Criação aprovada para aplicação futura' : proposed.decision === 'rejected' ? 'Criação rejeitada' : 'Novo sugerido · aguardando aprovação'}`
            : changes.length
              ? `Alterações propostas: +${changes.filter((c) => c.kind === 'ADD').length} / −${changes.filter((c) => c.kind === 'REMOVE').length}`
              : 'Existente · sem alterações'}
        </Typography>
      )}
      <SFlex sx={assisted ? { gridColumn: 2, gridRow: 1 } : undefined}>
        {(assisted || !hide) && (
          <>
            {(!assisted || !proposed) && (
              <>
                <STooltip withWrapper title={actionHint || 'Deletar'}>
                  <SIconButton
                    loading={isDeleteLoading}
                    disabled={isOrgMultiWorkspace || !!assistance?.persistenceBusy}
                    onClick={() => {
                      if (isOrgMultiWorkspace || assistance?.persistenceBusy) return;
                      handleDeleteGHO(data.id, data);
                    }}
                    size="small"
                  >
                    <Icon component={SDeleteIcon} sx={{ fontSize: '1.2rem' }} />
                  </SIconButton>
                </STooltip>
                {handleEditGHO && (
                  <STooltip withWrapper title={actionHint || 'Editar'}>
                    <SIconButton
                      disabled={isOrgMultiWorkspace || !!assistance?.persistenceBusy}
                      onClick={() => {
                        if (isOrgMultiWorkspace || assistance?.persistenceBusy) return;
                        handleEditGHO?.(data);
                      }}
                      size="small"
                    >
                      <Icon component={SEditIcon} sx={{ fontSize: '1.2rem' }} />
                    </SIconButton>
                  </STooltip>
                )}
              </>
            )}
            <STooltip
              withWrapper
              title={
                assisted
                  ? 'Visualizar e revisar vínculos na árvore'
                  : actionHint || (isEnvironment ? environmentLinkLabel : 'Adicionar cargos ao GSE')
              }
            >
              <SIconButton
                aria-label={
                  assisted
                    ? `Visualizar vínculos de ${data.name}`
                    : isEnvironment
                      ? `${environmentLinkLabel}: ${data.name}`
                      : undefined
                }
                disabled={isOrgMultiWorkspace || !!assistance?.persistenceBusy}
                onClick={() => {
                  if (isOrgMultiWorkspace || assistance?.persistenceBusy) return;
                  if (assisted)
                    assistance?.selectGroup(isSelected ? null : data.id);
                  else handleSelectGHO(isSelected ? null : data, hierarchies);
                }}
                size="small"
              >
                <Icon
                  component={isSelected ? SCloseIcon : SHierarchyIcon}
                  sx={{
                    fontSize: '1.2rem',
                    color: assisted
                      ? tone.color
                      : isSelected
                        ? 'info.main'
                        : '',
                  }}
                />
              </SIconButton>
            </STooltip>
          </>
        )}
        <div style={{ backgroundColor: 'red', width: 0 }} ref={anchorEl}></div>
      </SFlex>
      {assisted && proposed && (
        <Box
          sx={{
            width: '100%',
            gridColumn: '1 / -1',
            gridRow: 3,
            '& .MuiInputBase-input, & .MuiInputLabel-root, & .MuiButton-root': {
              color: tone.color,
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: tone.color },
            '& .Mui-disabled': { opacity: 0.55 },
          }}
        >
          <TextField
            size="small"
            fullWidth
            label="Nome do GSE sugerido"
            value={data.name}
            disabled={assistance?.stale || assistance?.persistenceBusy}
            onChange={(e) => assistance?.renameGroup(data.id, e.target.value)}
          />
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            label="Descrição sugerida do GSE"
            value={proposed.description ?? ''}
            disabled={assistance?.stale || assistance?.persistenceBusy}
            inputProps={{ maxLength: 2000 }}
            helperText="Proposta estrutural para revisão técnica. Os cargos citados não indicam vínculos já cadastrados."
            onChange={(e) =>
              assistance?.describeGroup?.(data.id, e.target.value)
            }
            sx={{
              mt: 1,
              '& .MuiInputBase-input': {
                fontSize: '11px',
                lineHeight: 1.35,
              },
            }}
          />
          <SFlex sx={{ flexWrap: 'wrap', gap: 1 }}>
            {proposed.decision === 'pending' && (
              <>
                <Button
                  size="small"
                  disabled={
                    assistance?.stale ||
                    assistance?.persistenceBusy ||
                    !data.name.trim()
                  }
                  onClick={() => assistance?.decideGroup(data.id, 'accepted')}
                >
                  Aceitar criação
                </Button>
                <Button
                  size="small"
                  disabled={assistance?.stale || assistance?.persistenceBusy}
                  onClick={() => assistance?.decideGroup(data.id, 'rejected')}
                >
                  Rejeitar
                </Button>
              </>
            )}
            {proposed.decision !== 'pending' && (
              <Button
                size="small"
                disabled={assistance?.stale || assistance?.persistenceBusy}
                onClick={() => assistance?.decideGroup(data.id, 'pending')}
              >
                Reabrir decisão
              </Button>
            )}
          </SFlex>
        </Box>
      )}
    </STBoxItem>
  );
};
