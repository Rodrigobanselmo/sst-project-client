import { FC, useMemo, useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { useFetchAcgihRiskCorrelation } from '@v2/services/medicine/acgih-risk-correlation/hooks/useFetchAcgihRiskCorrelation';
import {
  AcgihRiskCorrelationCardinality,
  AcgihRiskCorrelationDecisionSource,
  AcgihRiskCorrelationFinalStatus,
  IAcgihRiskCorrelationItem,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import { AcgihRiskCorrelationApplyDialog } from './components/AcgihRiskCorrelationApplyDialog';
import { AcgihRiskCorrelationConsolidateDialog } from './components/AcgihRiskCorrelationConsolidateDialog';
import { AcgihRiskCorrelationDetailDialog } from './components/AcgihRiskCorrelationDetailDialog';
import { AcgihRiskCorrelationTable } from './components/AcgihRiskCorrelationTable';
import {
  cardinalityLabels,
  decisionSourceLabels,
  finalStatusLabels,
} from './acgih-risk-correlation-labels';

const summaryCards: Array<{
  key:
    | 'total'
    | 'promotedCount'
    | 'notPromotedCount'
    | 'alreadyLinkedCount'
    | 'blockersCount';
  label: string;
}> = [
  { key: 'total', label: 'Total' },
  { key: 'promotedCount', label: 'Promovidos' },
  { key: 'notPromotedCount', label: 'Não promovidos' },
  { key: 'alreadyLinkedCount', label: 'Já vinculados' },
  { key: 'blockersCount', label: 'Bloqueios' },
];

const finalStatusOptions = Object.keys(
  finalStatusLabels,
) as AcgihRiskCorrelationFinalStatus[];
const decisionSourceOptions = Object.keys(
  decisionSourceLabels,
) as AcgihRiskCorrelationDecisionSource[];
const cardinalityOptions = Object.keys(
  cardinalityLabels,
) as AcgihRiskCorrelationCardinality[];

type ErrorWithStatus = { response?: { status?: number } };

export const AcgihRiskCorrelationPage: FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [finalStatus, setFinalStatus] = useState<'' | AcgihRiskCorrelationFinalStatus>('');
  const [decisionSource, setDecisionSource] = useState<
    '' | AcgihRiskCorrelationDecisionSource
  >('');
  const [cardinality, setCardinality] = useState<
    '' | AcgihRiskCorrelationCardinality
  >('');
  const [onlyBlockers, setOnlyBlockers] = useState(false);
  const [onlyMultiples, setOnlyMultiples] = useState(false);

  const { data, isLoading, isError, error } = useFetchAcgihRiskCorrelation({
    search: search.trim() || undefined,
  });

  const status = (error as ErrorWithStatus | undefined)?.response?.status;
  const isAuthError = status === 401 || status === 403;

  const [detailTarget, setDetailTarget] =
    useState<IAcgihRiskCorrelationItem | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [consolidateOpen, setConsolidateOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((item) => {
      if (finalStatus && item.finalStatus !== finalStatus) return false;
      if (decisionSource && item.decisionSource !== decisionSource) return false;
      if (cardinality && item.cardinality !== cardinality) return false;
      if (onlyBlockers && item.blockers.length === 0) return false;
      if (onlyMultiples && item.cardinality !== 'MULTIPLE') return false;
      return true;
    });
  }, [
    data?.items,
    finalStatus,
    decisionSource,
    cardinality,
    onlyBlockers,
    onlyMultiples,
  ]);

  const summary = data?.summary;

  // Vínculos esperados = soma dos vínculos de todos os itens sem bloqueio (TDI
  // contribui com 2). Reflete o que o apply A.3 criaria (66 no cenário-alvo).
  const expectedLinks = useMemo(
    () =>
      (data?.items ?? []).reduce(
        (acc, item) => acc + (item.blockers.length === 0 ? item.links.length : 0),
        0,
      ),
    [data?.items],
  );

  const hasData = !!summary && summary.total > 0;
  const allPromoted = hasData && summary.notPromotedCount === 0;
  const noBlockers = !!summary && summary.blockersCount === 0;
  const canConsolidate =
    !isLoading && !isError && allPromoted && noBlockers;
  // Mostra a ação de promoção completa (os 65) enquanto houver faltantes.
  const canPromoteMissing =
    !isLoading && !isError && hasData && summary.notPromotedCount > 0;

  const renderCountChips = (counts?: Record<string, number>, kind?: string) => {
    if (!counts) return null;
    const entries = Object.entries(counts);
    if (!entries.length) return null;
    return (
      <Box display="flex" gap={0.75} flexWrap="wrap">
        {entries.map(([key, value]) => {
          const label =
            kind === 'finalStatus'
              ? (finalStatusLabels[key as AcgihRiskCorrelationFinalStatus] ?? key)
              : kind === 'decisionSource'
                ? (decisionSourceLabels[
                    key as AcgihRiskCorrelationDecisionSource
                  ] ?? key)
                : kind === 'cardinality'
                  ? (cardinalityLabels[key as AcgihRiskCorrelationCardinality] ??
                    key)
                  : key;
          return (
            <Chip
              key={key}
              size="small"
              variant="outlined"
              label={`${label}: ${value}`}
              sx={{ cursor: 'default' }}
            />
          );
        })}
      </Box>
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
            <Typography variant="h5">
              ACGIH/BEI — Correlação com Fatores de Risco
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Correlação entre os indicadores ACGIH/BEI promovidos e os Fatores
              de Risco do sistema. Combina match automático (reuso NR-7, CAS
              exato, CAS em grupo, nome/sinônimo) com overrides manuais
              versionados. A consolidação cria apenas vínculos de risco — não
              cria regras na Biblioteca Risco × Exame.
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={0.5}>
              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                  router.push(RoutesEnum.DATABASE_ACGIH_BEI_PROMOTION_PREVIEW)
                }
                sx={{ px: 0 }}
              >
                Ir para Promoção ACGIH/BEI (preview)
              </Button>
            </Box>
          </Box>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            {canPromoteMissing && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setConsolidateOpen(true)}
              >
                Promover ACGIH/BEI faltantes ({summary?.notPromotedCount})
              </Button>
            )}
            <Button
              variant="contained"
              disabled={!canConsolidate}
              onClick={() => setApplyOpen(true)}
            >
              Consolidar vínculos com Fatores de Risco
            </Button>
          </Box>
        </Box>

        {hasData && !allPromoted && (
          <Alert
            severity="warning"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setConsolidateOpen(true)}
              >
                Promover faltantes
              </Button>
            }
          >
            Ainda existem <strong>{summary?.notPromotedCount}</strong> ACGIH/BEI
            não promovidos. Clique em <strong>Promover ACGIH/BEI faltantes</strong>{' '}
            para promover toda a base ({summary?.total}) como indicador oficial —
            inclusive itens com cobertura NR-7 — antes de consolidar vínculos.
          </Alert>
        )}

        {canConsolidate && (
          <Alert severity="success">
            Todos os <strong>{summary?.total}</strong> indicadores estão
            promovidos e não há bloqueios. Você pode consolidar os vínculos com
            os Fatores de Risco ({expectedLinks} vínculos esperados).
          </Alert>
        )}

        {isAuthError && (
          <Alert severity="warning">
            Você não tem permissão para visualizar este preview (
            {status === 403 ? '403 — acesso negado' : '401 — não autenticado'}).
            Confirme que está autenticado como MASTER.
          </Alert>
        )}

        {isError && !isAuthError && (
          <Alert severity="error">
            Não foi possível carregar a correlação ACGIH/BEI × Fatores de Risco.
            Tente novamente em instantes.
          </Alert>
        )}

        <Box display="flex" gap={1.5} flexWrap="wrap">
          {summaryCards.map((card) => (
            <Paper
              key={card.key}
              sx={{ px: 2, py: 1, minWidth: 130, textAlign: 'center' }}
            >
              <Typography variant="h6">{summary?.[card.key] ?? 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                {card.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" flexDirection="column" gap={1.5}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Por status final
              </Typography>
              {renderCountChips(summary?.countsByFinalStatus, 'finalStatus')}
            </Box>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Por fonte da decisão
                </Typography>
                {renderCountChips(
                  summary?.countsByDecisionSource,
                  'decisionSource',
                )}
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Por cardinalidade
                </Typography>
                {renderCountChips(summary?.countsByCardinality, 'cardinality')}
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Box
            display="flex"
            gap={2}
            flexWrap="wrap"
            mb={2}
            alignItems="center"
          >
            <TextField
              label="Buscar (substância, CAS ou determinante)"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status final</InputLabel>
              <Select
                label="Status final"
                value={finalStatus}
                onChange={(event) =>
                  setFinalStatus(
                    event.target.value as '' | AcgihRiskCorrelationFinalStatus,
                  )
                }
              >
                <MenuItem value="">Todos</MenuItem>
                {finalStatusOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {finalStatusLabels[opt]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Fonte da decisão</InputLabel>
              <Select
                label="Fonte da decisão"
                value={decisionSource}
                onChange={(event) =>
                  setDecisionSource(
                    event.target.value as
                      | ''
                      | AcgihRiskCorrelationDecisionSource,
                  )
                }
              >
                <MenuItem value="">Todas</MenuItem>
                {decisionSourceOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {decisionSourceLabels[opt]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Cardinalidade</InputLabel>
              <Select
                label="Cardinalidade"
                value={cardinality}
                onChange={(event) =>
                  setCardinality(
                    event.target.value as '' | AcgihRiskCorrelationCardinality,
                  )
                }
              >
                <MenuItem value="">Todas</MenuItem>
                {cardinalityOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {cardinalityLabels[opt]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={onlyBlockers}
                  onChange={(event) => setOnlyBlockers(event.target.checked)}
                />
              }
              label="Somente bloqueios"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={onlyMultiples}
                  onChange={(event) => setOnlyMultiples(event.target.checked)}
                />
              }
              label="Somente múltiplos"
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            Exibindo {filteredItems.length} de {data?.items?.length ?? 0} itens.
          </Typography>

          <AcgihRiskCorrelationTable
            data={filteredItems}
            isLoading={isLoading}
            onOpenDetail={setDetailTarget}
          />
        </Paper>
      </Box>

      <AcgihRiskCorrelationDetailDialog
        item={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <AcgihRiskCorrelationApplyDialog
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        promotedCount={summary?.promotedCount ?? 0}
        expectedLinks={expectedLinks}
      />

      <AcgihRiskCorrelationConsolidateDialog
        open={consolidateOpen}
        onClose={() => setConsolidateOpen(false)}
        totalCount={summary?.total ?? 0}
        promotedCount={summary?.promotedCount ?? 0}
        notPromotedCount={summary?.notPromotedCount ?? 0}
      />
    </SAuthShow>
  );
};
