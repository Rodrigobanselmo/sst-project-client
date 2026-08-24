import { useCallback, useMemo, useState } from 'react';

import { useSnackbar } from 'notistack';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { queryGenerateSource } from 'core/services/hooks/queries/useQueryGenerateSource/useQueryGenerateSource';
import { queryRecMed } from 'core/services/hooks/queries/useQueryRecMed/useQueryRecMed';
import { queryClient } from 'core/services/queryClient';

import {
  buildRiskCatalogBulkAddPayload,
  classifyBulkNamesAgainstCatalog,
  getBulkCatalogNameGetter,
  RISK_CATALOG_BULK_ADD_SUCCESS_LABEL,
  RiskCatalogBulkAddKind,
} from './build-risk-catalog-bulk-add-payload.util';
import {
  filterNamesAlreadyLinked,
  parseRiskCatalogBulkLines,
} from './parse-risk-catalog-bulk-lines.util';
import { applyRecBulkResidual } from './with-residual-probability-after-rec-change.util';

type UseRiskCatalogBulkAddParams = {
  kind: RiskCatalogBulkAddKind;
  risk?: IRiskFactors | null;
  riskData?: Partial<IRiskData> | null;
  handleSelect: (values: Partial<IUpsertRiskData>) => void | Promise<void>;
};

function linkedNamesForKind(
  kind: RiskCatalogBulkAddKind,
  riskData?: Partial<IRiskData> | null,
): Array<string | null | undefined> {
  if (kind === 'generateSource') {
    return (riskData?.generateSources ?? []).map((item) => item?.name);
  }
  if (kind === 'adm') {
    return (riskData?.adms ?? []).map((item) => item?.medName);
  }
  if (kind === 'eng') {
    return (riskData?.engs ?? []).map((item) => item?.medName);
  }
  return (riskData?.recs ?? []).map((item) => item?.recName);
}

export const useRiskCatalogBulkAdd = ({
  kind,
  risk,
  riskData,
  handleSelect,
}: UseRiskCatalogBulkAddParams) => {
  const { companyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [recType, setRecType] = useState<RecTypeEnum>(RecTypeEnum.ADM);
  const [submitting, setSubmitting] = useState(false);

  const parsed = useMemo(
    () => parseRiskCatalogBulkLines(rawText),
    [rawText],
  );

  const preview = useMemo(() => {
    const linked = filterNamesAlreadyLinked(
      parsed.items,
      linkedNamesForKind(kind, riskData),
    );
    return {
      ...parsed,
      toAdd: linked.toAdd,
      alreadyLinkedCount: linked.alreadyLinkedCount,
    };
  }, [kind, parsed, riskData]);

  const openDialog = useCallback(() => {
    setRawText('');
    setRecType(RecTypeEnum.ADM);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    if (submitting) return;
    setOpen(false);
    setRawText('');
  }, [submitting]);

  const fetchCatalog = useCallback(async () => {
    if (!companyId || !risk?.id) return [];

    if (kind === 'generateSource') {
      const result = await queryGenerateSource(
        { skip: 0, take: 300 },
        { companyId, riskIds: [risk.id] },
      );
      return result.data || [];
    }

    const result = await queryRecMed(
      { skip: 0, take: 300 },
      {
        companyId,
        riskIds: [risk.id],
        ...(kind === 'rec'
          ? { onlyRec: true }
          : {
              onlyMed: true,
              medType: [kind === 'eng' ? MedTypeEnum.ENG : MedTypeEnum.ADM],
            }),
      },
    );
    return result.data || [];
  }, [companyId, kind, risk?.id]);

  const submit = useCallback(async () => {
    if (!companyId || !risk?.id) return;
    if (!preview.toAdd.length) {
      enqueueSnackbar('Nenhum item novo para cadastrar.', {
        variant: 'info',
      });
      return;
    }

    setSubmitting(true);
    try {
      let existingIds: string[] = [];
      let existingItems: Array<{
        id?: string | number;
        recType?: RecTypeEnum | string | null;
        recName?: string | null;
        status?: string | null;
      }> = [];
      let namesToCreate = preview.toAdd;

      try {
        const catalog = await fetchCatalog();
        const classified = classifyBulkNamesAgainstCatalog(
          preview.toAdd,
          catalog,
          getBulkCatalogNameGetter(kind),
        );
        existingIds = classified.existingIds;
        existingItems = classified.existingItems;
        namesToCreate = classified.namesToCreate;
      } catch {
        existingIds = [];
        existingItems = [];
        namesToCreate = preview.toAdd;
      }

      let payload = buildRiskCatalogBulkAddPayload({
        kind,
        existingIds,
        namesToCreate,
        companyId,
        recType,
      });

      if (!payload) {
        enqueueSnackbar('Nenhum item novo para cadastrar.', {
          variant: 'info',
        });
        return;
      }

      if (kind === 'rec') {
        payload = applyRecBulkResidual({
          payload,
          currentRecs: (riskData?.recs ?? []).filter(
            (rec) => !!rec && typeof rec.id === 'string' && !!rec.id,
          ),
          catalogMatches: existingItems.map((item) => ({
            id: item.id == null ? undefined : String(item.id),
            recType: item.recType,
            recName: item.recName,
            status: item.status,
          })),
          namesToCreate,
          recType,
          realProbability: riskData?.probability,
          currentResidual: riskData?.probabilityAfter,
        });
      }

      await handleSelect(payload);

      queryClient.invalidateQueries([QueryEnum.REC_MED]);
      queryClient.invalidateQueries([QueryEnum.GENERATE_SOURCE]);

      const added = existingIds.length + namesToCreate.length;
      const labels = RISK_CATALOG_BULK_ADD_SUCCESS_LABEL[kind];
      const lines = [
        `${added} ${added === 1 ? labels.one : labels.many} cadastrada${
          added === 1 ? '' : 's'
        }/vinculada${added === 1 ? '' : 's'}.`,
      ];
      if (existingIds.length) {
        lines.push(
          `${existingIds.length} já existiam no catálogo e foram vinculadas.`,
        );
      }
      if (namesToCreate.length) {
        lines.push(
          `${namesToCreate.length} ${
            namesToCreate.length === 1 ? 'nova' : 'novas'
          } no catálogo deste fator.`,
        );
      }
      if (preview.alreadyLinkedCount) {
        lines.push(
          `${preview.alreadyLinkedCount} já estavam vinculadas neste risco.`,
        );
      }
      if (preview.duplicateCount) {
        lines.push(
          `${preview.duplicateCount} repetida${
            preview.duplicateCount === 1 ? '' : 's'
          } na lista foram ignoradas.`,
        );
      }

      enqueueSnackbar(lines.join(' '), { variant: 'success' });
      setOpen(false);
      setRawText('');
    } catch {
      enqueueSnackbar('Não foi possível cadastrar os itens. Tente novamente.', {
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    companyId,
    enqueueSnackbar,
    fetchCatalog,
    handleSelect,
    kind,
    preview.alreadyLinkedCount,
    preview.duplicateCount,
    preview.toAdd,
    recType,
    risk?.id,
    riskData,
  ]);

  return {
    open,
    rawText,
    setRawText,
    recType,
    setRecType,
    submitting,
    preview,
    openDialog,
    closeDialog,
    submit,
  };
};
