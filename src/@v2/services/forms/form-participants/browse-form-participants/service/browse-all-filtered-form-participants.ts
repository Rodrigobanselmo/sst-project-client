import { FormParticipantsBrowseModel } from '@v2/models/form/models/form-participants/form-participants-browse.model';
import { browseFormParticipants } from './browse-form-participants.service';
import { BrowseFormParticipantsParams } from './browse-form-participants.types';

export const FORM_PARTICIPANTS_GROUPED_FETCH_CAP = 10_000;

const BATCH_SIZE = 500;

export type BrowseAllFilteredFormParticipantsParams = Omit<
  BrowseFormParticipantsParams,
  'pagination'
> & {
  maxRows?: number;
};

/**
 * Carrega todos os participantes do recorte filtrado (até maxRows),
 * paginando em lotes para não depender de um único request com limit alto.
 */
export async function browseAllFilteredFormParticipants(
  params: BrowseAllFilteredFormParticipantsParams,
): Promise<FormParticipantsBrowseModel> {
  const maxRows = params.maxRows ?? FORM_PARTICIPANTS_GROUPED_FETCH_CAP;
  let page = 1;
  const allResults: FormParticipantsBrowseModel['results'] = [];
  let filterSummary: FormParticipantsBrowseModel['filterSummary'] | undefined;

  while (allResults.length < maxRows) {
    const remaining = maxRows - allResults.length;
    const limit = Math.min(BATCH_SIZE, remaining);

    const bundle = await browseFormParticipants({
      ...params,
      pagination: { page, limit },
    });

    filterSummary = bundle.filterSummary;
    const batch = bundle.results ?? [];
    allResults.push(...batch);

    const targetTotal = Math.min(filterSummary.totalParticipants, maxRows);

    if (batch.length === 0) break;
    if (allResults.length >= targetTotal) break;
    if (batch.length < limit) break;

    page += 1;
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
