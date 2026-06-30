import { FC, useState } from 'react';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { persistKeys } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useFetchAcgihPromotionPreview } from '@v2/services/medicine/acgih-promotion-preview/hooks/useFetchAcgihPromotionPreview';
import {
  IAcgihPromotionPreviewItem,
  IAcgihPromotionPreviewTotals,
} from '@v2/services/medicine/acgih-promotion-preview/service/acgih-promotion-preview.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import { AcgihPromotionApplyDialog } from './components/AcgihPromotionApplyDialog';
import { AcgihPromotionPreviewDetailDialog } from './components/AcgihPromotionPreviewDetailDialog';
import { AcgihPromotionPreviewTable } from './components/AcgihPromotionPreviewTable';

const totalsConfig: Array<{
  key: keyof IAcgihPromotionPreviewTotals;
  label: string;
}> = [
  { key: 'total', label: 'Total' },
  { key: 'eligible', label: 'Elegíveis' },
  { key: 'warning', label: 'Com aviso' },
  { key: 'blocked', label: 'Bloqueados' },
  { key: 'primary', label: 'Primários' },
  { key: 'divergenceDerived', label: 'Derivados de divergência' },
];

export const AcgihPromotionPreviewPage: FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [includeDivergenceDerived, setIncludeDivergenceDerived] =
    useState(false);

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(
      undefined,
      persistKeys.LIMIT_ACGIH_BEI_PROMOTION_PREVIEW,
    );

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const { data, isLoading, isError } = useFetchAcgihPromotionPreview({
    page,
    limit: pageLimit,
    search: search.trim() || undefined,
    includeDivergenceDerived,
  });

  const [detailTarget, setDetailTarget] =
    useState<IAcgihPromotionPreviewItem | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);

  const eligibleCount = data?.totals?.eligible ?? 0;
  const canApply = !isLoading && !isError && eligibleCount > 0;
  const applyTooltip = isError
    ? 'Corrija o erro do preview antes de promover.'
    : isLoading
      ? 'Aguarde o carregamento do preview.'
      : eligibleCount === 0
        ? 'Nenhum candidato elegível para promover.'
        : 'Promover candidatos elegíveis como indicadores oficiais DRAFT.';

  // "Promover todos elegíveis": garante que primários E derivados elegíveis
  // entrem no preview/apply. Liga o opt-in de divergência antes de abrir o modal
  // (refetch dos totais) e o apply é feito com includeDivergenceDerived=true.
  const handleOpenApply = () => {
    if (!includeDivergenceDerived) {
      setIncludeDivergenceDerived(true);
      setPage(1);
    }
    setApplyOpen(true);
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
              Promoção ACGIH/BEI — Preview (dry-run)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preview somente leitura dos candidatos ACGIH/BEI confirmados que
              poderiam, no futuro, virar indicadores oficiais. Nenhum indicador,
              regra ou vínculo é criado nesta etapa.
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap" mt={0.5}>
              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() =>
                  router.push(RoutesEnum.DATABASE_ACGIH_BEI_COMPARISON)
                }
                sx={{ px: 0 }}
              >
                Voltar à comparação ACGIH/BEI
              </Button>
            </Box>
          </Box>
          <Tooltip title={applyTooltip}>
            <span>
              <Button
                variant="contained"
                disabled={!canApply}
                onClick={handleOpenApply}
              >
                Promover todos elegíveis
              </Button>
            </span>
          </Tooltip>
        </Box>

        <Alert severity="info">
          Preview somente leitura. Nenhum indicador será criado nesta etapa.
          Itens <strong>elegíveis</strong> seriam criados futuramente como
          rascunho (DRAFT), com curadoria manual posterior.{' '}
          <strong>Bloqueados</strong> não serão promovidos sem correção/revisão.{' '}
          <strong>Com aviso</strong> exigem atenção, mas não bloqueiam
          necessariamente. Ter <strong>decisão técnica</strong> registrada não
          significa, por si só, que o item seja promovível: <strong>Primário</strong>{' '}
          = candidato ACGIH confirmado sem match; <strong>Derivado de divergência</strong>{' '}
          = divergência técnica real, incluído apenas com o toggle abaixo.
        </Alert>

        {isError && (
          <Alert severity="error">
            Não foi possível carregar o preview de promoção ACGIH/BEI. Tente
            novamente em instantes.
          </Alert>
        )}

        <Box display="flex" gap={1.5} flexWrap="wrap">
          {totalsConfig.map((item) => (
            <Paper
              key={item.key}
              sx={{ px: 2, py: 1, minWidth: 130, textAlign: 'center' }}
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
              sx={{ minWidth: 300 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={includeDivergenceDerived}
                  onChange={(event) => {
                    setIncludeDivergenceDerived(event.target.checked);
                    setPage(1);
                  }}
                />
              }
              label="Incluir divergências reais"
            />
          </Box>

          <AcgihPromotionPreviewTable
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
            onOpenDetail={setDetailTarget}
          />
        </Paper>
      </Box>

      <AcgihPromotionPreviewDetailDialog
        item={detailTarget}
        onClose={() => setDetailTarget(null)}
      />

      <AcgihPromotionApplyDialog
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        eligible={eligibleCount}
        primary={data?.totals?.primary ?? 0}
        divergenceDerived={data?.totals?.divergenceDerived ?? 0}
        includeDivergenceDerived={includeDivergenceDerived}
      />
    </SAuthShow>
  );
};
