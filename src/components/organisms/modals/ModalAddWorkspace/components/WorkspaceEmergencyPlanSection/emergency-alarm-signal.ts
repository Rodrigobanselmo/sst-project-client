import { WorkspaceEmergencySignalType } from 'core/interfaces/api/IWorkspaceEmergencyPlan';

export type EmergencyAlarmSignalStrategy =
  | 'empty'
  | 'pulses'
  | 'bars'
  | 'unavailable';

export type EmergencyAlarmSignalLayout = {
  strategy: EmergencyAlarmSignalStrategy;
  type: WorkspaceEmergencySignalType | null;
  segmentCount: number;
  durationSeconds: number | null;
};

const parsePositiveInt = (value?: string | number | null): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
    return value;
  }

  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : null;
};

const parseSignalType = (
  value?: string | null,
): WorkspaceEmergencySignalType | null => {
  if (
    value === 'INTERMITENTE' ||
    value === 'CONTINUO_LONGO' ||
    value === 'CUSTOM'
  ) {
    return value;
  }
  return null;
};

export const buildEmergencyAlarmSignalLayout = (input: {
  signalType?: string | null;
  signalCount?: string | number | null;
  durationSeconds?: string | number | null;
}): EmergencyAlarmSignalLayout => {
  const type = parseSignalType(input.signalType);
  const segmentCount = parsePositiveInt(input.signalCount) ?? 0;
  const durationSeconds = parsePositiveInt(input.durationSeconds);

  if (type === 'CUSTOM') {
    return {
      strategy: 'unavailable',
      type,
      segmentCount,
      durationSeconds,
    };
  }

  if (!type || segmentCount < 1) {
    return {
      strategy: 'empty',
      type,
      segmentCount,
      durationSeconds,
    };
  }

  return {
    strategy: type === 'INTERMITENTE' ? 'pulses' : 'bars',
    type,
    segmentCount,
    durationSeconds,
  };
};

export const getEmergencyAlarmPulseSize = (segmentCount: number) => {
  if (segmentCount <= 8) return { width: 22, height: 10, gap: 10 };
  if (segmentCount <= 16) return { width: 14, height: 10, gap: 8 };
  if (segmentCount <= 32) return { width: 10, height: 8, gap: 6 };
  return { width: 8, height: 8, gap: 4 };
};
