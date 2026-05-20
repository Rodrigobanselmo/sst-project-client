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
  fillGridCellLaunch,
  ...props
}: ISActionButtonProps) => {
  const { sx: sxProp, ...restProps } = props;
  const isLaunchRow = Boolean(fillGridCell && fillGridCellLaunch);
  const isUpperGridCard = Boolean(
    fillGridCell && fillGridCellCompact && !fillGridCellLaunch,
  );

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

  const showParticipationBar =
    participationPercent != null &&
    !Number.isNaN(participationPercent) &&
    Boolean(participationBarMuiColor) &&
    !loading;

  const isLaunchHeaderMetric = (label: string) => {
    const normalized = label.toLowerCase().trim();
    return normalized === 'total' || normalized === 'registros';
  };

  const launchHeaderInfo =
    isLaunchRow && infos
      ? infos.find((item) => isLaunchHeaderMetric(item.label))
      : undefined;

  const launchBodyInfos =
    isLaunchRow && launchHeaderInfo
      ? infos?.filter((item) => item !== launchHeaderInfo) ?? []
      : infos;

  const launchBodyMid = Math.ceil((launchBodyInfos?.length ?? 0) / 2);

  const renderLaunchInfo = (item: { label: string; value: string | number }) => (
    <SText
      key={item.label}
      fontSize={12}
      lineHeight={1.35}
      fontWeight={getInfoWeight(item.label)}
      color={getInfoColor(item.label)}
    >
      {item.label}: {item.value}
    </SText>
  );

  return (
    <STooltip title={tooltipText}>
      <STBox
        active={active ? 1 : 0}
        width={fillGridCell ? '100%' : 'fit-content'}
        disabled={disabled || loading ? 1 : 0}
        color={color as string | undefined}
        sx={{
          ...(isLaunchRow
            ? {
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                height: '100%',
                minHeight: 0,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                padding: (theme) => theme.spacing(3),
              }
            : isUpperGridCard
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
              : fillGridCell
                ? {
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
        <SFlex
          align={'center'}
          gap={isLaunchRow ? 4 : 5}
          px={2}
          flexShrink={0}
          width="100%"
          minWidth={0}
          sx={isLaunchRow ? { mb: 2 } : undefined}
        >
          {!loading && (
            <>
              <Icon
                component={icon}
                sx={{ fontSize: isLaunchRow ? 24 : 30, flexShrink: 0 }}
              />
              <SText
                fontSize={isLaunchRow ? 14 : 15}
                fontWeight={500}
                noWrap={isLaunchRow}
              >
                {text}
              </SText>
              {isLaunchRow && launchHeaderInfo && (
                <SText
                  fontSize={12}
                  fontWeight={getInfoWeight(launchHeaderInfo.label)}
                  color={getInfoColor(launchHeaderInfo.label)}
                  sx={{ ml: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {launchHeaderInfo.label}: {launchHeaderInfo.value}
                </SText>
              )}
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
        {statusLabel && !loading && !isLaunchRow && (
          <Box px={2} pt={1}>
            <SText fontSize={12} color="text.secondary" fontWeight={500}>
              {statusLabel}
            </SText>
          </Box>
        )}
        <Box
          sx={{
            flex: fillGridCell ? 1 : undefined,
            minHeight: fillGridCell ? 0 : undefined,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: isLaunchRow
              ? showParticipationBar
                ? 'space-between'
                : 'space-evenly'
              : 'flex-start',
          }}
        >
          {isLaunchRow ? (
            <SFlex
              px={3}
              py={2}
              sx={{ flex: 1, minHeight: 0 }}
              gap={3}
              alignItems="flex-start"
            >
              <SFlex flex={1} flexDirection="column" gap={1} minWidth={0}>
                {launchBodyInfos
                  ?.slice(0, launchBodyMid)
                  .map((item) => renderLaunchInfo(item))}
              </SFlex>
              <SFlex flex={1} flexDirection="column" gap={1} minWidth={0}>
                {launchBodyInfos
                  ?.slice(launchBodyMid)
                  .map((item) => renderLaunchInfo(item))}
              </SFlex>
            </SFlex>
          ) : (
            <SFlex sx={{ flex: 1, minHeight: 0 }}>
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
          )}
          {showParticipationBar && (
            <Box
              px={2}
              pb={isLaunchRow ? 1 : 2}
              width="100%"
              minWidth={fillGridCell ? 0 : 220}
              flexShrink={0}
            >
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, participationPercent))}
                color={participationBarMuiColor}
                sx={{
                  height: isLaunchRow ? 6 : 8,
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
        </Box>
      </STBox>
    </STooltip>
  );
};
