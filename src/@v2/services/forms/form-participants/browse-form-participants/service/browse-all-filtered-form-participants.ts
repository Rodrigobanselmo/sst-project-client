import { FormParticipantsBrowseModel } from '@v2/models/form/models/form-participants/form-participants-browse.model';
import { browseFormParticipants } from './browse-form-participants.service';
import { BrowseFormParticipantsParams } from './browse-form-participants.types';

export const FORM_PARTICIPANTS_GROUPED_FETCH_CAP = 10_000;

const BATCH_SIZE = 500;

const isDev = process.env.NODE_ENV !== 'production';

export type BrowseAllFilteredFormParticipantsParams = Omit<
  BrowseFormParticipantsParams,
  'pagination'
> & {
  maxRows?: number;
};

/**
 * Carrega todos os participantes do recorte filtrado (até maxRows),
 * paginando em lotes até atingir filterSummary.totalParticipants ou não haver próxima página.
 *
 * Não usa `batch.length < requestedLimit` como fim de paginação: a API pode devolver
 * o default (20) mesmo quando pedimos 500 — nesse caso continuamos pelas páginas.
 */
export async function browseAllFilteredFormParticipants(
  params: BrowseAllFilteredFormParticipantsParams,
): Promise<FormParticipantsBrowseModel> {
  const maxRows = params.maxRows ?? FORM_PARTICIPANTS_GROUPED_FETCH_CAP;
  let page = 1;
  const allResults: FormParticipantsBrowseModel['results'] = [];
  let filterSummary: FormParticipantsBrowseModel['filterSummary'] | undefined;
  const maxPages = Math.ceil(maxRows / BATCH_SIZE) + 5;

  while (allResults.length < maxRows && page <= maxPages) {
    const bundle = await browseFormParticipants({
      ...params,
      pagination: { page, limit: BATCH_SIZE },
    });

    filterSummary = bundle.filterSummary;
    const batch = bundle.results ?? [];
    const seenIds = new Set(allResults.map((row) => row.id));
    for (const row of batch) {
      if (seenIds.has(row.id)) continue;
      seenIds.add(row.id);
      allResults.push(row);
    }

    const recorteTotal = filterSummary.totalParticipants;
    const targetTotal =
      recorteTotal > 0 ? Math.min(recorteTotal, maxRows) : maxRows;

    if (isDev) {
      console.debug('[browseAllFilteredFormParticipants]', {
        page,
        requestedLimit: BATCH_SIZE,
        apiReportedLimit: bundle.pagination.limit,
        batchLength: batch.length,
        loaded: allResults.length,
        recorteTotal,
        targetTotal,
        hasNextPage: bundle.pagination.nextPage,
      });
    }

    if (batch.length === 0) break;

    if (recorteTotal > 0 && allResults.length >= targetTotal) break;

    const nextPage = bundle.pagination.nextPage;
    if (!nextPage) break;

    page = nextPage;
  }

  const fs = filterSummary ?? {
    totalParticipants: allResults.length,
    respondedCount: 0,
    notRespondedCount: allResults.length,
    responseRatePercent: 0,
  };

  return new FormParticipantsBrowseModel({
    results: allResults,
    pagination: {
      page: 1,
      limit: allResults.length,
      total: fs.totalParticipants,
    },
    filterSummary: fs,
  });
}
