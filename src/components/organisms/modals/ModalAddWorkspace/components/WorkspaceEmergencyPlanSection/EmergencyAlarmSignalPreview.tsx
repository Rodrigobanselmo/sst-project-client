import { Box } from '@mui/material';
import SText from 'components/atoms/SText';

import {
  buildEmergencyAlarmSignalLayout,
  getEmergencyAlarmPulseSize,
} from './emergency-alarm-signal';

type EmergencyAlarmSignalPreviewProps = {
  signalType?: string | null;
  signalCount?: string | number | null;
  durationSeconds?: string | number | null;
};

const segmentSx = {
  bgcolor: 'text.primary',
  borderRadius: '3px',
  flexShrink: 0,
};

export const EmergencyAlarmSignalPreview = ({
  signalType,
  signalCount,
  durationSeconds,
}: EmergencyAlarmSignalPreviewProps) => {
  const layout = buildEmergencyAlarmSignalLayout({
    signalType,
    signalCount,
    durationSeconds,
  });
  const pulse = getEmergencyAlarmPulseSize(layout.segmentCount);
  const durationLabel =
    layout.durationSeconds != null ? `Duração: ${layout.durationSeconds} s` : null;

  return (
    <Box
      sx={{
        width: '100%',
        p: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <SText fontSize={13} fontWeight={600} mb={3}>
        Pré-visualização do sinal
      </SText>

      {layout.strategy === 'unavailable' ? (
        <SText color="text.secondary" fontSize={13}>
          Pré-visualização indisponível para tipo personalizado
        </SText>
      ) : null}

      {layout.strategy === 'empty' ? (
        <SText color="text.secondary" fontSize={13}>
          Informe o tipo e a quantidade de toques para visualizar o padrão.
        </SText>
      ) : null}

      {layout.strategy === 'pulses' ? (
        <Box
          role="img"
          aria-label={`${layout.segmentCount} toques intermitentes`}
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: `${pulse.gap}px`,
            width: '100%',
            minHeight: 28,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: layout.segmentCount }, (_, index) => (
            <Box
              key={index}
              aria-hidden
              sx={{
                ...segmentSx,
                width: pulse.width,
                height: pulse.height,
              }}
            />
          ))}
        </Box>
      ) : null}

      {layout.strategy === 'bars' ? (
        <Box
          role="img"
          aria-label={
            layout.segmentCount === 1
              ? '1 toque contínuo longo'
              : `${layout.segmentCount} toques contínuos longos`
          }
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: layout.segmentCount === 1 ? 0 : 3,
            width: '100%',
            minHeight: 28,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: layout.segmentCount }, (_, index) => (
            <Box
              key={index}
              aria-hidden
              sx={{
                ...segmentSx,
                flex: '1 1 48px',
                minWidth: 48,
                maxWidth: layout.segmentCount === 1 ? '100%' : undefined,
                height: 10,
              }}
            />
          ))}
        </Box>
      ) : null}

      {durationLabel ? (
        <SText color="text.secondary" fontSize={12} mt={3}>
          {durationLabel}
        </SText>
      ) : null}
    </Box>
  );
};
