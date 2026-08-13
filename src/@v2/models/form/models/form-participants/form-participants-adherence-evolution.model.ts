export const ADHERENCE_EVOLUTION_TIMEZONE = 'America/Sao_Paulo' as const;

export type IFormParticipantsAdherenceEvolutionSeriesPoint = {
  date: string;
  newResponses: number;
  cumulativeResponses: number;
  cumulativePercent: number;
};

export type IFormParticipantsAdherenceEvolutionModel = {
  startedAt: string;
  endedAt: string | null;
  asOf: string;
  timezone: typeof ADHERENCE_EVOLUTION_TIMEZONE;
  totalParticipants: number;
  respondedCount: number;
  participationGoal: number | null;
  series: IFormParticipantsAdherenceEvolutionSeriesPoint[];
};

function asIsoString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
}

function asNonNegativeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function normalizeAdherenceEvolutionPayload(
  raw: unknown,
): IFormParticipantsAdherenceEvolutionModel {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const seriesRaw = Array.isArray(d.series) ? d.series : [];

  const startedAt =
    asIsoString(d.startedAt) ?? asIsoString(d.started_at) ?? new Date().toISOString();
  const endedAt = asIsoString(d.endedAt) ?? asIsoString(d.ended_at);

  return {
    startedAt,
    endedAt,
    asOf: asIsoString(d.asOf) ?? asIsoString(d.as_of) ?? new Date().toISOString(),
    timezone: ADHERENCE_EVOLUTION_TIMEZONE,
    totalParticipants: asNonNegativeNumber(
      d.totalParticipants ?? d.total_participants,
    ),
    respondedCount: asNonNegativeNumber(d.respondedCount ?? d.responded_count),
    participationGoal: (() => {
      const goal = d.participationGoal ?? d.participation_goal;
      if (goal == null || goal === '') return null;
      const n = Number(goal);
      if (!Number.isFinite(n) || n <= 0) return null;
      return n;
    })(),
    series: seriesRaw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const row = item as Record<string, unknown>;
        const date = typeof row.date === 'string' ? row.date : '';
        if (!date) return null;
        return {
          date,
          newResponses: asNonNegativeNumber(row.newResponses ?? row.new_responses),
          cumulativeResponses: asNonNegativeNumber(
            row.cumulativeResponses ?? row.cumulative_responses,
          ),
          cumulativePercent: asNonNegativeNumber(
            row.cumulativePercent ?? row.cumulative_percent,
          ),
        };
      })
      .filter((row): row is IFormParticipantsAdherenceEvolutionSeriesPoint => !!row),
  };
}
