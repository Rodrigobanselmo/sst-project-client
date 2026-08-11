import { FC, useMemo, useState } from 'react';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import type {
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

import {
  enrichChemicalOccupationalData,
  recordOccupationalSearchAuditIncomplete,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalOccupationalEnrichResult,
  ChemicalOccupationalSearchAudit,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { pickDefaultWorkspace } from 'core/utils/helpers/pick-default-workspace.util';
import { useSnackbar } from 'notistack';
import {
  isValidCasRn,
  softNormalizeCas,
} from '@v2/pages/companies/chemical-products/components/chemical-curation-create-risk.util';

import {
  OccupationalLimitCasRequiredDialog,
  OccupationalLimitReviewDialog,
  OccupationalLimitSearchBusy,
} from './OccupationalLimitReviewDialog';
import type { OccupationalLimitFormSnapshot } from './occupational-limit-apply.util';
import { assertNoLegacyLimitString } from './occupational-limit-apply.util';
import {
  formatOccupationalSearchStatusLabel,
  formatOccupationalSearchTooltip,
  parseOccupationalSearchAudit,
} from './occupational-search-status.util';

type OccupationalLimitSearchButtonProps = {
  riskData: Record<string, any>;
  setRiskData: (updater: (current: any) => any) => void;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
  watch: UseFormWatch<any>;
  disabled?: boolean;
};

function snapshotFromForm(
  riskData: Record<string, any>,
  values: Record<string, any>,
): OccupationalLimitFormSnapshot {
  return {
    cas: values.cas ?? riskData.cas ?? null,
    unit: values.unit ?? riskData.unit ?? null,
    nioshRel: values.nioshRel ?? riskData.nioshRel ?? null,
    nioshStel: values.nioshStel ?? riskData.nioshStel ?? null,
    nioshCeiling: values.nioshCeiling ?? riskData.nioshCeiling ?? null,
    ipvs: values.ipvs ?? riskData.ipvs ?? null,
    oshaPel: values.oshaPel ?? riskData.oshaPel ?? null,
    oshaStel: values.oshaStel ?? riskData.oshaStel ?? null,
    oshaCeiling: values.oshaCeiling ?? riskData.oshaCeiling ?? null,
    breather: values.breather ?? riskData.breather ?? null,
    json: (riskData.json as OccupationalLimitFormSnapshot['json']) || null,
  };
}

function existingRiskId(riskData: Record<string, any>): string | null {
  const id = String(riskData?.id || '').trim();
  if (!id || id === 'undefined' || id === 'null') return null;
  return id;
}

export const OccupationalLimitSearchButton: FC<
  OccupationalLimitSearchButtonProps
> = ({
  riskData,
  setRiskData,
  setValue,
  getValues,
  watch,
  disabled = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId, workspaceId: routeWorkspaceId } = useGetCompanyId();
  const resolvedCompanyId = String(riskData.companyId || companyId || '');
  const { data: company } = useQueryCompany(resolvedCompanyId || undefined);
  const [loading, setLoading] = useState(false);
  const [casDialogOpen, setCasDialogOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [result, setResult] = useState<ChemicalOccupationalEnrichResult | null>(
    null,
  );
  const [snapshotAtSearch, setSnapshotAtSearch] =
    useState<OccupationalLimitFormSnapshot>({});

  const resolvedWorkspaceId = useMemo(() => {
    if (routeWorkspaceId) return String(routeWorkspaceId);
    const pickable =
      company?.workspace?.map((w) => ({
        id: w.id,
        name: w.name,
        abbreviation: w.abbreviation,
        description: w.description,
        isOwner: w.isOwner,
      })) || [];
    return pickDefaultWorkspace(pickable) || '';
  }, [routeWorkspaceId, company?.workspace]);

  const watchedCas = watch('cas');

  const persistedAudit = useMemo(
    () => parseOccupationalSearchAudit(riskData.json),
    [riskData.json],
  );
  const statusLabel = formatOccupationalSearchStatusLabel(persistedAudit);
  const statusTooltip = formatOccupationalSearchTooltip(persistedAudit);

  const mirrorAuditLocally = (audit: ChemicalOccupationalSearchAudit) => {
    setRiskData((current) => ({
      ...current,
      json: {
        ...(current.json || {}),
        occupationalSearch: audit,
      },
    }));
  };

  const handleSearch = async () => {
    const values = getValues();
    const current = snapshotFromForm(riskData, values);
    const casNorm = softNormalizeCas(String(current.cas || watchedCas || ''));
    const cas = casNorm.value;

    if (!cas || !isValidCasRn(cas)) {
      setCasDialogOpen(true);
      return;
    }

    if (!resolvedCompanyId || !resolvedWorkspaceId) {
      enqueueSnackbar(
        'Não foi possível determinar empresa/estabelecimento para a pesquisa.',
        { variant: 'warning' },
      );
      return;
    }

    const riskId = existingRiskId(riskData);

    setLoading(true);
    setResult(null);
    try {
      const enrich = await enrichChemicalOccupationalData({
        companyId: resolvedCompanyId,
        workspaceId: resolvedWorkspaceId,
        cas,
        officialName: values.name || riskData.name || null,
        targetUnit: current.unit || values.unit || riskData.unit || null,
        persistToRiskId: riskId,
      });
      setSnapshotAtSearch(current);
      setResult(enrich);
      // Espelha audit no estado local (persistido na API se RF existente).
      // Cancelar o modal de revisão NÃO apaga este registro.
      if (enrich.searchAudit) {
        mirrorAuditLocally(enrich.searchAudit);
      }
      setReviewOpen(true);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Falha ao pesquisar limites ocupacionais.';
      enqueueSnackbar(String(message), { variant: 'error' });

      if (riskId) {
        try {
          const incomplete = await recordOccupationalSearchAuditIncomplete({
            companyId: resolvedCompanyId,
            workspaceId: resolvedWorkspaceId,
            riskId,
            cas,
            message: String(message),
          });
          if (incomplete?.occupationalSearch) {
            mirrorAuditLocally(incomplete.occupationalSearch);
          }
        } catch {
          // Falha silenciosa no registro de incompleto — não bloquear UX.
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (patch: OccupationalLimitFormSnapshot) => {
    const limitKeys = [
      'nioshRel',
      'nioshStel',
      'nioshCeiling',
      'ipvs',
      'oshaPel',
      'oshaStel',
      'oshaCeiling',
      'unit',
    ] as const;

    for (const key of limitKeys) {
      const value = patch[key];
      if (value == null || value === '') continue;
      if (!assertNoLegacyLimitString(value)) {
        enqueueSnackbar(
          `Valor rejeitado em ${key}: formato legado com unidade embutida.`,
          { variant: 'error' },
        );
        return;
      }
    }

    for (const key of limitKeys) {
      const value = patch[key];
      if (value == null || value === '') continue;
      setValue(key, value, { shouldDirty: true });
    }

    setRiskData((current) => {
      const next = { ...current };
      for (const key of limitKeys) {
        const value = patch[key];
        if (value == null || value === '') continue;
        next[key] = value;
      }
      if (patch.json) {
        next.json = {
          ...(current.json || {}),
          ...patch.json,
          // Preserva auditoria já espelhada/persistida.
          occupationalSearch:
            patch.json.occupationalSearch ||
            current.json?.occupationalSearch ||
            undefined,
          ipvs: {
            ...(current.json?.ipvs || {}),
            ...(patch.json.ipvs || {}),
          },
        };
      }
      return next;
    });

    enqueueSnackbar(
      'Limites aplicados ao formulário. Revise e salve quando estiver pronto.',
      { variant: 'success' },
    );
    setReviewOpen(false);
  };

  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Button
          size="small"
          variant="outlined"
          startIcon={
            loading ? undefined : <SearchOutlinedIcon sx={{ fontSize: 18 }} />
          }
          onClick={handleSearch}
          disabled={disabled || loading}
        >
          {loading ? 'Pesquisando…' : 'Pesquisar limites ocupacionais'}
        </Button>
        <Tooltip
          title={
            <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
              {statusTooltip}
            </Box>
          }
          arrow
        >
          <Typography
            variant="body2"
            color={
              persistedAudit?.status === 'FOUND'
                ? 'success.main'
                : persistedAudit?.status === 'REVIEW_REQUIRED'
                  ? 'warning.main'
                  : persistedAudit?.status === 'INCOMPLETE'
                    ? 'error.main'
                    : persistedAudit?.status === 'NOT_FOUND'
                      ? 'text.primary'
                      : 'text.secondary'
            }
            sx={{
              cursor: 'help',
              maxWidth: 480,
              fontWeight: persistedAudit?.status ? 600 : 400,
            }}
          >
            {statusLabel}
          </Typography>
        </Tooltip>
      </Box>
      <Typography variant="caption" color="text.secondary" display="block">
        Consulta NIOSH/OSHA · revisão humana · não salva automaticamente
      </Typography>
      <OccupationalLimitSearchBusy loading={loading} />

      <OccupationalLimitCasRequiredDialog
        open={casDialogOpen}
        onClose={() => setCasDialogOpen(false)}
      />

      <OccupationalLimitReviewDialog
        open={reviewOpen}
        result={result}
        current={snapshotAtSearch}
        onClose={() => setReviewOpen(false)}
        onApply={handleApply}
      />
    </Box>
  );
};
