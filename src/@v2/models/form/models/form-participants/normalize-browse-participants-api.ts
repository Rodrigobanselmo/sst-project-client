/**
 * Normaliza payload da API de browse de participantes (camelCase/snake_case,
 * números como string, totais divergentes) antes de instanciar o model.
 */
function optionalNonNegativeNumber(n: unknown): number | undefined {
  if (n === undefined || n === null) return undefined;
  if (typeof n === 'bigint') {
    const x = Number(n);
    return Number.isFinite(x) && x >= 0 ? x : undefined;
  }
  if (typeof n === 'string' && n.trim() !== '') {
    const x = Number(n);
    return Number.isFinite(x) && x >= 0 ? x : undefined;
  }
  const x = Number(n);
  return Number.isFinite(x) && x >= 0 ? x : undefined;
}

function countRespondedInRawResults(results: unknown[]): number {
  return results.filter((r) => {
    if (!r || typeof r !== 'object') return false;
    const o = r as Record<string, unknown>;
    return o.hasResponded === true || o.has_responded === true;
  }).length;
}

export type NormalizedBrowseParticipantsPayload = {
  results: unknown[];
  pagination: { total: number; page: number; limit: number };
  filterSummary: {
    totalParticipants: number;
    respondedCount: number;
    notRespondedCount: number;
    responseRatePercent: number;
  };
};

export function normalizeBrowseParticipantsApiPayload(
  raw: unknown,
): NormalizedBrowseParticipantsPayload {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const results = Array.isArray(d.results) ? d.results : [];
  const p = (d.pagination && typeof d.pagination === 'object'
    ? d.pagination
    : {}) as Record<string, unknown>;

  const page = optionalNonNegativeNumber(p.page) ?? 1;
  const limit = optionalNonNegativeNumber(p.limit) ?? 15;
  const pagTotal = optionalNonNegativeNumber(p.total ?? p.total_count ?? p.totalCount);

  const fs = (d.filterSummary ?? d.filter_summary) as Record<string, unknown> | undefined;

  const fsTotal = optionalNonNegativeNumber(fs?.totalParticipants ?? fs?.total_participants);

  let totalParticipants: number;
  if (fsTotal !== undefined && fsTotal > 0) {
    totalParticipants = fsTotal;
  } else if (pagTotal !== undefined && pagTotal > 0) {
    totalParticipants = pagTotal;
  } else if (results.length > 0) {
    totalParticipants = results.length;
  } else {
    totalParticipants = fsTotal ?? pagTotal ?? 0;
  }

  let respondedCount = optionalNonNegativeNumber(
    fs?.respondedCount ?? fs?.responded_count,
  );

  if (respondedCount === undefined) {
    if (totalParticipants > 0 && results.length === totalParticipants) {
      respondedCount = countRespondedInRawResults(results);
    } else {
      respondedCount = 0;
    }
  }

  const countedOnPage = countRespondedInRawResults(results);
  if (
    totalParticipants > 0 &&
    respondedCount === 0 &&
    results.length === totalParticipants &&
    countedOnPage > 0
  ) {
    respondedCount = countedOnPage;
  }

  const notRespondedCount = Math.max(0, totalParticipants - respondedCount);
  const responseRatePercent =
    totalParticipants > 0
      ? Math.round((respondedCount / totalParticipants) * 1000) / 10
      : 0;

  return {
    results,
    pagination: { total: totalParticipants, page, limit },
    filterSummary: {
      totalParticipants,
      respondedCount,
      notRespondedCount,
      responseRatePercent,
    },
  };
}
