import { Box, CircularProgress, Icon, LinearProgress } from '@mui/material';
import { ISActionButtonProps } from 'components/atoms/SActionButton/types';
import SText from 'components/atoms/SText';

import SFlex from '../SFlex';
import STooltip from '../STooltip';
import { STBox } from './styles';

export const SActionGroupButton = ({
  text,
  icon,
  active,
  tooltipText,
  loading,
  disabled,
  color,
  infos,
  statusLabel,
  participationPercent,
  formCardId: _formCardId,
  fillGridCell,
  fillGridCellCompact,
  ...props
}: ISActionButtonProps) => {
  const { sx: sxProp, ...restProps } = props;
  const getInfoColor = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('afastad')) return 'error.main';
    if (normalized.includes('dias perdidos')) return 'grey.600';
    if (normalized.includes('ativo') && !normalized.includes('inativo'))
      return 'success.main';
    if (normalized.includes('inativo')) return 'grey.600';
    if (normalized.includes('pendent')) return 'grey.600';
    if (normalized.includes('iniciad')) return 'info.main';
    if (normalized.includes('conclu')) return 'success.main';
    if (normalized.includes('cancelad')) return 'error.main';
    return 'text.light';
  };

  const getInfoWeight = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('total')) return 700;
    if (normalized.includes('registro')) return 700;
    if (normalized.includes('afastado') || normalized.includes('afastad'))
      return 500;
    if (normalized.includes('ativo') && !normalized.includes('inativo'))
      return 700;
    return 500;
  };

  const participationBarMuiColor =
    participationPercent === null ||
    participationPercent === undefined ||
    Number.isNaN(participationPercent)
      ? undefined
      : participationPercent < 50
        ? 'error'
        : participationPercent < 80
          ? 'info'
          : 'success';

  const participationLabelColor =
    participationPercent === null ||
    participationPercent === undefined ||
    Number.isNaN(participationPercent)
      ? 'text.secondary'
      : participationPercent < 50
        ? 'error.main'
        : participationPercent < 80
          ? 'info.main'
          : 'success.main';

  return (
    <STooltip title={tooltipText}>
      <STBox
        active={active ? 1 : 0}
        width={fillGridCell ? '100%' : 'fit-content'}
        disabled={disabled || loading ? 1 : 0}
        color={color as string | undefined}
        sx={{
          ...(fillGridCell
            ? fillGridCellCompact
              ? {
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  height: '100%',
                  minHeight: 0,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                }
              : {
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  height: '100%',
                  minHeight: 240,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                }
            : {}),
          ...sxProp,
        }}
        {...restProps}
      >
        <SFlex align={'center'} gap={5} px={2}>
          {!loading && (
            <>
              <Icon component={icon} sx={{ fontSize: 30 }} />
              <SText fontSize={15} fontWeight={500}>
                {text}
              </SText>
            </>
          )}
          {loading && (
            <>
              <CircularProgress color="primary" size={18} />
              <SText fontSize={15} fontWeight={500}>
                Carregando...
              </SText>
            </>
          )}
        </SFlex>
        {statusLabel && !loading && (
          <Box px={2} pt={1}>
            <SText fontSize={12} color="text.secondary" fontWeight={500}>
              {statusLabel}
            </SText>
          </Box>
        )}
        <SFlex
          sx={
            fillGridCell && !fillGridCellCompact
              ? { flex: 1, minHeight: 0 }
              : undefined
          }
        >
          <SFlex p={10} px={4} pb={5} flexDirection={'column'}>
            {infos &&
              infos.slice(0, 3).map((item) => (
                <SText
                  key={item.label}
                  fontSize={13}
                  fontWeight={getInfoWeight(item.label)}
                  color={getInfoColor(item.label)}
                >
                  {item.label}: {item.value}
                </SText>
              ))}
          </SFlex>
          <SFlex p={10} pr={0} pb={5} flexDirection={'column'}>
            {infos &&
              infos?.length > 3 &&
              infos.slice(3, 6).map((item) => (
                <SText
                  key={item.label}
                  fontSize={13}
                  fontWeight={getInfoWeight(item.label)}
                  color={getInfoColor(item.label)}
                >
                  {item.label}: {item.value}
                </SText>
              ))}
          </SFlex>
        </SFlex>
        {participationPercent != null &&
          !Number.isNaN(participationPercent) &&
          participationBarMuiColor &&
          !loading && (
            <Box
              px={2}
              pb={2}
              width="100%"
              minWidth={fillGridCell ? 0 : 220}
              sx={
                fillGridCell && !fillGridCellCompact ? { mt: 'auto' } : undefined
              }
            >
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, participationPercent))}
                color={participationBarMuiColor}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  backgroundColor: 'grey.200',
                }}
              />
              <SText
                fontSize={12}
                fontWeight={600}
                sx={{ mt: 0.5, color: participationLabelColor }}
              >
                {participationPercent.toLocaleString('pt-BR', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
                %
              </SText>
            </Box>
          )}
      </STBox>
    </STooltip>
  );
};
