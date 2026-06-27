import { FC, useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DownloadIcon from '@mui/icons-material/Download';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useExportAcgihBeiComparison } from '@v2/services/medicine/acgih-bei-comparison/hooks/useAcgihBeiComparisonExport';
import { useFetchBrowseAcgihBeiComparison } from '@v2/services/medicine/acgih-bei-comparison/hooks/useFetchBrowseAcgihBeiComparison';
import { useMutateApplyAcgihReference } from '@v2/services/medicine/acgih-bei-comparison/hooks/useMutateApplyAcgihReference';
import {
  AcgihBeiComparisonStatusEnum,
  AcgihBeiSuggestedActionEnum,
  IAcgihBeiComparisonRow,
  IAcgihBeiComparisonTotals,
} from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';
import { AcgihBeiIndicatorConfidenceEnum } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  comparisonStatusLabels,
  suggestedActionLabels,
} from './acgih-bei-comparison-labels';
import { AcgihBeiAddReferenceDialog } from './components/AcgihBeiAddReferenceDialog';
import { AcgihBeiComparisonTable } from './components/AcgihBeiComparisonTable';
import { acgihBeiConfidenceLabels } from '../acgih-bei-indicators/acgih-bei-indicator-labels';

const ALL = 'ALL';

const totalsConfig: Array<{
  key: keyof IAcgihBeiComparisonTotals;
  label: string;
}> = [
  { key: 'total', label: 'Total' },
  { key: 'alreadyCovered', label: 'Já coberto' },
  { key: 'divergent', label: 'Divergente' },
  { key: 'needsReview', label: 'Requer revisão' },
  { key: 'newCandidate', label: 'Candidato novo' },
  { key: 'lowConfidenceReview', label: 'Baixa confiança' },
];

export const AcgihBeiComparisonListPage: FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [comparisonStatus, setComparisonStatus] = useState<
    AcgihBeiComparisonStatusEnum | typeof ALL
  >(ALL);
  const [suggestedAction, setSuggestedAction] = useState<
    AcgihBeiSuggestedActionEnum | typeof ALL
  >(ALL);
  const [confidence, setConfidence] = useState<
    AcgihBeiIndicatorConfidenceEnum | typeof ALL
  >(ALL);

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_ACGIH_BEI_COMPARISON);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const activeFilters = {
    search: search.trim() || undefined,
    comparisonStatus:
      comparisonStatus === ALL ? undefined : comparisonStatus,
    suggestedAction: suggestedAction === ALL ? undefined : suggestedAction,
    confidence: confidence === ALL ? undefined : confidence,
  };

  const { data, isLoading } = useFetchBrowseAcgihBeiComparison({
    page,
    limit: pageLimit,
    ...activeFilters,
  });

  const exportMutation = useExportAcgihBeiComparison();

  const [referenceTarget, setReferenceTarget] =
    useState<IAcgihBeiComparisonRow | null>(null);
  const applyReferenceMutation = useMutateApplyAcgihReference();

  const handleConfirmReference = () => {
    if (!referenceTarget || applyReferenceMutation.isPending) return;
    applyReferenceMutation.mutate(
      { acgihBeiIndicatorId: referenceTarget.acgihBeiId },
      { onSuccess: () => setReferenceTarget(null) },
    );
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h5">ACGIH/BEI × NR-7 × Regras</Typography>
            <Typography variant="body2" color="text.secondary">
              Análise diagnóstica e somente leitura entre a base ACGIH/BEI, a base
              NR-7 e a biblioteca Exame × Risco. Identifica itens já cobertos,
              divergentes, candidatos novos e sugestões de fonte complementar, sem
              criar ou alterar regras automaticamente.
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={0.5}>
              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                  router.push(RoutesEnum.DATABASE_ACGIH_BEI_INDICATORS)
                }
                sx={{ px: 0 }}
              >
                Voltar à base ACGIH/BEI
              </Button>
              <Button
                variant="text"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push(RoutesEnum.DATABASE_EXAM_RISK_RULES)}
                sx={{ px: 0 }}
              >
                Abrir Biblioteca Exame × Risco
              </Button>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate(activeFilters)}
          >
            Exportar Excel
          </Button>
        </Box>

        <Box display="flex" gap={1.5} flexWrap="wrap">
          {totalsConfig.map((item) => (
            <Paper
              key={item.key}
              sx={{ px: 2, py: 1, minWidth: 120, textAlign: 'center' }}
            >
              <Typography variant="h6">
                {data?.totals?.[item.key] ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2} alignItems="center">
            <TextField
              label="Buscar (substância, CAS ou determinante)"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 280 }}
            />
            <TextField
              select
              label="Classificação"
              value={comparisonStatus}
              onChange={(event) => {
                setComparisonStatus(
                  event.target.value as
                    | AcgihBeiComparisonStatusEnum
                    | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiComparisonStatusEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {comparisonStatusLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Ação sugerida"
              value={suggestedAction}
              onChange={(event) => {
                setSuggestedAction(
                  event.target.value as
                    | AcgihBeiSuggestedActionEnum
                    | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiSuggestedActionEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {suggestedActionLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Confiança"
              value={confidence}
              onChange={(event) => {
                setConfidence(
                  event.target.value as
                    | AcgihBeiIndicatorConfidenceEnum
                    | typeof ALL,
                );
                setPage(1);
              }}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value={ALL}>Todas</MenuItem>
              {Object.values(AcgihBeiIndicatorConfidenceEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {acgihBeiConfidenceLabels[value]}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <AcgihBeiComparisonTable
            data={data?.data ?? []}
            isLoading={isLoading}
            pagination={{
              total: data?.count ?? 0,
              limit: pageLimit,
              page,
            }}
            setPage={setPage}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
            onAddReference={setReferenceTarget}
            applyingId={
              applyReferenceMutation.isPending
                ? referenceTarget?.acgihBeiId
                : null
            }
          />
        </Paper>
      </Box>

      <AcgihBeiAddReferenceDialog
        row={referenceTarget}
        isApplying={applyReferenceMutation.isPending}
        onClose={() => {
          if (!applyReferenceMutation.isPending) setReferenceTarget(null);
        }}
        onConfirm={handleConfirmReference}
      />
    </SAuthShow>
  );
};
